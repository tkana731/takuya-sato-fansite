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
        official_url,
        description,
        workRoles:rel_work_roles(
          role:role_id (
            name,
            actor:voice_actor_id (name)
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
        wr.role?.actor?.name === '佐藤拓也'
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

    // Schedules table search
    const { data: scheduleResults, error: scheduleError } = await supabase
      .from('schedules')
      .select(`
        id,
        title,
        start_datetime,
        description,
        venue:venue_id (name),
        category:category_id (name)
      `)
      .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order('start_datetime', { ascending: false })
      .limit(10);

    if (scheduleError) throw scheduleError;

    scheduleResults?.forEach(schedule => {
      let score = 5;
      
      // Calculate score based on title match
      if (schedule.title === searchTerm) score = 100;
      else if (schedule.title.toLowerCase().startsWith(searchTerm.toLowerCase())) score = 50;
      else if (schedule.title.toLowerCase().includes(searchTerm.toLowerCase())) score = 25;
      else if (schedule.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())) score = 10;
      
      results.push({
        id: schedule.id,
        title: schedule.title,
        type: 'schedule',
        page: 'schedule',
        url: '/schedule',
        description: schedule.description,
        start_date: schedule.start_datetime,
        category: schedule.category?.name,
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
        rel_work_roles (
          works (
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
      const workTitles = character.rel_work_roles?.map(wr => wr.works?.title).filter(Boolean) || [];
      
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
        rel_song_staff(
          mst_staff (name),
          mst_song_staff_roles (name)
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
      const lyricsBy = song.rel_song_staff?.filter(s => s.mst_song_staff_roles?.name === '作詞')?.map(s => s.mst_staff?.name).join('、') || '';
      const composedBy = song.rel_song_staff?.filter(s => s.mst_song_staff_roles?.name === '作曲')?.map(s => s.mst_staff?.name).join('、') || '';
      
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
      .from('products')
      .select(`
        id,
        title,
        product_code,
        release_date,
        description,
        mst_product_categories (
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
      else if (product.mst_product_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())) score = 10;
      
      results.push({
        id: product.id,
        title: product.title,
        type: 'product',
        page: 'products',
        url: '/products',
        description: product.description,
        price: null, // price情報が不明なのでnullに設定
        release_date: product.release_date,
        category: product.mst_product_categories?.name,
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