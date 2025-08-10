import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q: query } = req.query;

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const searchTerm = query.trim();
  const searchPattern = `%${searchTerm}%`;

  try {
    const results = [];
    const stats = { total: 0, byType: {} };

    // Works table search - 佐藤拓也の出演作品のみ
    const { data: workResults, error: workError } = await supabase
      .from('works')
      .select(`
        id,
        title,
        year,
        officialUrl:official_url,
        description,
        workRoles:rel_work_roles(
          role:mst_roles(
            name,
            voiceActor:mst_actors!mst_roles_voice_actor_id_fkey(name)
          )
        )
      `)
      .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order('year', { ascending: false })
      .limit(10);

    if (workError) throw workError;

    // Filter for works where 佐藤拓也 has a role
    workResults?.forEach(work => {
      const takuyaRoles = work.workRoles?.filter(wr => 
        wr.role?.voiceActor?.name === '佐藤拓也'
      );
      
      if (takuyaRoles && takuyaRoles.length > 0) {
        const roleNames = takuyaRoles.map(r => r.role?.name).filter(Boolean);
        let score = 10;
        
        // Calculate score based on title match
        if (work.title === searchTerm) score = 100;
        else if (work.title.toLowerCase().startsWith(searchTerm.toLowerCase())) score = 50;
        else if (work.title.toLowerCase().includes(searchTerm.toLowerCase())) score = 25;
        
        results.push({
          id: work.id,
          title: work.title,
          type: 'work',
          page: 'works',
          url: '/works',
          role: roleNames.join('、'),
          year: work.year,
          description: work.description,
          score: score
        });
      }
    });

    // Schedules table search - イベント名と詳細情報で検索
    const { data: scheduleResults, error: scheduleError } = await supabase
      .from('schedules')
      .select(`
        id,
        title,
        start_datetime,
        description,
        venue:mst_venues (name),
        broadcastStation:mst_broadcast_stations (name),
        category:mst_schedule_categories (name, color_code),
        performers:rel_schedule_performers (
          performer:mst_performers (name)
        )
      `)
      .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order('start_datetime', { ascending: false })
      .limit(20);

    // 会場名での検索
    const { data: schedulesByVenue, error: venueError } = await supabase
      .from('schedules')
      .select(`
        id,
        title,
        start_datetime,
        description,
        venue:mst_venues!inner (name),
        broadcastStation:mst_broadcast_stations (name),
        category:mst_schedule_categories (name, color_code),
        performers:rel_schedule_performers (
          performer:mst_performers (name)
        )
      `)
      .ilike('venue.name', searchPattern)
      .order('start_datetime', { ascending: false })
      .limit(10);

    // 放送局名での検索
    const { data: schedulesByBroadcast, error: broadcastError } = await supabase
      .from('schedules')
      .select(`
        id,
        title,
        start_datetime,
        description,
        venue:mst_venues (name),
        broadcastStation:mst_broadcast_stations!inner (name),
        category:mst_schedule_categories (name, color_code),
        performers:rel_schedule_performers (
          performer:mst_performers (name)
        )
      `)
      .ilike('broadcastStation.name', searchPattern)
      .order('start_datetime', { ascending: false })
      .limit(10);

    if (scheduleError) throw scheduleError;

    // 出演者での検索結果を追加取得
    const { data: scheduleByPerformer, error: performerError } = await supabase
      .from('rel_schedule_performers')
      .select(`
        schedule:schedules (
          id,
          title,
          start_datetime,
          description,
          venue:mst_venues (name),
          broadcastStation:mst_broadcast_stations (name),
          category:mst_schedule_categories (name, color_code),
          performers:rel_schedule_performers (
            performer:mst_performers (name)
          )
        ),
        performer:mst_performers (name)
      `)
      .ilike('performer.name', searchPattern)
      .order('schedule.start_datetime', { ascending: false })
      .limit(10);

    // 全ての検索結果をマージ
    const allScheduleResults = [...(scheduleResults || [])];
    
    if (!venueError && schedulesByVenue) {
      allScheduleResults.push(...schedulesByVenue);
    }
    
    if (!broadcastError && schedulesByBroadcast) {
      allScheduleResults.push(...schedulesByBroadcast);
    }
    
    if (!performerError && scheduleByPerformer) {
      const performerSchedules = scheduleByPerformer
        .filter(item => item.schedule)
        .map(item => item.schedule);
      allScheduleResults.push(...performerSchedules);
    }

    // 重複を除去
    const uniqueSchedules = allScheduleResults.filter((schedule, index, self) =>
      index === self.findIndex(s => s.id === schedule.id)
    );

    uniqueSchedules.forEach(schedule => {
      let score = 5;
      const title = schedule.title?.toLowerCase() || '';
      const venue = schedule.venue?.name?.toLowerCase() || '';
      const broadcastStation = schedule.broadcastStation?.name?.toLowerCase() || '';
      const performers = schedule.performers?.map(p => p.performer?.name?.toLowerCase()).filter(Boolean) || [];
      const searchLower = searchTerm.toLowerCase();
      
      // スコア計算（優先度順）
      if (schedule.title === searchTerm) score = 100;
      else if (title.startsWith(searchLower)) score = 50;
      else if (title.includes(searchLower)) score = 25;
      else if (performers.some(p => p === searchLower)) score = 20;
      else if (venue.includes(searchLower) || broadcastStation.includes(searchLower)) score = 15;
      else if (performers.some(p => p.includes(searchLower))) score = 10;
      
      // 出演者情報を整形
      const performerNames = schedule.performers?.map(p => p.performer?.name).filter(Boolean) || [];
      
      results.push({
        id: schedule.id,
        title: schedule.title,
        type: 'schedule',
        page: 'schedule',
        url: `/schedules/${schedule.id}`,
        description: schedule.description,
        start_date: schedule.start_datetime,
        category: schedule.category?.name,
        categoryColor: schedule.category?.color_code,
        performers: performerNames,
        venue: schedule.venue?.name,
        broadcastStation: schedule.broadcastStation?.name,
        score: score
      });
    });

    // Characters table search (using mst_roles table)
    const { data: characterResults, error: characterError } = await supabase
      .from('mst_roles')
      .select(`
        id,
        name,
        birthday,
        workRoles:rel_work_roles (
          work:works (
            id,
            title
          )
        )
      `)
      .ilike('name', searchPattern)
      .order('name')
      .limit(10);

    if (characterError) throw characterError;

    characterResults?.forEach(character => {
      let score = 5;
      
      // Calculate score based on character name match
      if (character.name === searchTerm) score = 100;
      else if (character.name.toLowerCase().startsWith(searchTerm.toLowerCase())) score = 50;
      else if (character.name.toLowerCase().includes(searchTerm.toLowerCase())) score = 25;
      
      // Get work titles for this character
      const workTitles = character.workRoles?.map(wr => wr.work?.title).filter(Boolean) || [];
      
      results.push({
        id: character.id,
        title: character.name,
        type: 'character',
        page: 'characters',
        url: '/characters',
        work_title: workTitles.join('、'),
        birthday: character.birthday,
        description: null,
        score: score
      });
    });

    // Songs table search
    const { data: songResults, error: songError } = await supabase
      .from('songs')
      .select(`
        id,
        title,
        artist,
        song_type,
        songStaff:rel_song_staff(
          staff:mst_staff (name),
          songStaffRole:mst_song_staff_roles (name)
        )
      `)
      .or(`title.ilike.${searchPattern},artist.ilike.${searchPattern}`)
      .order('title')
      .limit(10);

    if (songError) throw songError;

    songResults?.forEach(song => {
      let score = 5;
      
      // Calculate score based on song title match
      if (song.title === searchTerm) score = 100;
      else if (song.title.toLowerCase().startsWith(searchTerm.toLowerCase())) score = 50;
      else if (song.title.toLowerCase().includes(searchTerm.toLowerCase())) score = 25;
      else if (song.artist?.toLowerCase().includes(searchTerm.toLowerCase())) score = 10;
      
      // Extract lyrics and composition info
      const lyricsBy = song.songStaff?.filter(s => s.songStaffRole?.name === '作詞')?.map(s => s.staff?.name).join('、') || '';
      const composedBy = song.songStaff?.filter(s => s.songStaffRole?.name === '作曲')?.map(s => s.staff?.name).join('、') || '';
      
      results.push({
        id: song.id,
        title: song.title,
        type: 'song',
        page: 'songs',
        url: '/songs',
        artist: song.artist,
        song_type: song.song_type,
        lyrics_by: lyricsBy,
        composed_by: composedBy,
        score: score
      });
    });

    // Products table search
    const { data: productResults, error: productError } = await supabase
      .from('product_base')
      .select(`
        id,
        title,
        release_date,
        description,
        category:mst_product_categories (
          name,
          code
        )
      `)
      .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order('release_date', { ascending: false })
      .limit(10);

    if (productError) throw productError;

    productResults?.forEach(product => {
      let score = 5;
      
      // Calculate score based on product title match
      if (product.title === searchTerm) score = 100;
      else if (product.title.toLowerCase().startsWith(searchTerm.toLowerCase())) score = 50;
      else if (product.title.toLowerCase().includes(searchTerm.toLowerCase())) score = 25;
      else if (product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())) score = 10;
      
      results.push({
        id: product.id,
        title: product.title,
        type: 'product',
        page: 'products',
        url: '/products',
        description: product.description,
        price: null, // price情報が不明なのでnullに設定
        release_date: product.release_date,
        category: product.category?.name,
        score: score
      });
    });

    // Sort all results by score
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Calculate statistics
    stats.total = results.length;
    stats.byType = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      query: searchTerm,
      results: sortedResults,
      stats: stats
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}