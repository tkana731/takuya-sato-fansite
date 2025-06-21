// pages/api/songs.js
import { fetchData } from '../../lib/api-helpers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 楽曲データを取得（関連するスタッフ情報も含める）
    const { data: songs } = await fetchData(
      'songs',
      {
        select: `
          id,
          title,
          artist,
          song_type,
          release_date,
          description,
          rel_song_staff!inner (
            song_staff_role_id,
            display_order,
            mst_staff!inner (
              id,
              name
            ),
            mst_song_staff_roles!inner (
              id,
              name
            )
          )
        `,
        order: { release_date: 'desc' } // リリース日の降順
      }
    );

    if (!songs) {
      return res.status(500).json({ message: 'データベースエラー' });
    }

    // 楽曲をキャラクターソングと本人名義に分類
    const characterSongs = [];
    const personalSongs = [];
    
    // キャラクターソングと本人名義の分類基準
    const characterSongTypes = ['character', 'op', 'ed', 'insert'];
    const personalSongTypes = ['solo', 'duet', 'group', 'cover', 'original', 'theme'];
    
    // 楽曲データを整理（複数のrel_song_staffレコードを統合）
    const songsMap = new Map();
    
    songs.forEach(songRecord => {
      const songId = songRecord.id;
      
      if (!songsMap.has(songId)) {
        songsMap.set(songId, {
          id: songRecord.id,
          title: songRecord.title,
          artist: songRecord.artist,
          songType: songRecord.song_type,
          releaseDate: songRecord.release_date,
          description: songRecord.description,
          releaseYear: songRecord.release_date ? new Date(songRecord.release_date).getFullYear() : null,
          staff: []
        });
      }
      
      // スタッフ情報を追加
      if (songRecord.rel_song_staff && songRecord.rel_song_staff.length > 0) {
        songRecord.rel_song_staff.forEach(staffRecord => {
          songsMap.get(songId).staff.push({
            name: staffRecord.mst_staff.name,
            role: staffRecord.mst_song_staff_roles.name,
            displayOrder: staffRecord.display_order
          });
        });
      }
    });
    
    // 統合された楽曲データを分類
    Array.from(songsMap.values()).forEach(song => {
      // スタッフを役割別に整理
      const lyricists = song.staff.filter(s => s.role === '作詞').sort((a, b) => a.displayOrder - b.displayOrder).map(s => s.name);
      const composers = song.staff.filter(s => s.role === '作曲').sort((a, b) => a.displayOrder - b.displayOrder).map(s => s.name);
      const arrangers = song.staff.filter(s => s.role === '編曲').sort((a, b) => a.displayOrder - b.displayOrder).map(s => s.name);
      
      const songData = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        songType: song.songType,
        releaseDate: song.releaseDate,
        description: song.description,
        lyricists: lyricists.length > 0 ? lyricists : [],
        composers: composers.length > 0 ? composers : [],
        arrangers: arrangers.length > 0 ? arrangers : [],
        releaseYear: song.releaseYear
      };
      
      if (characterSongTypes.includes(song.songType)) {
        characterSongs.push(songData);
      } else if (personalSongTypes.includes(song.songType)) {
        personalSongs.push(songData);
      } else {
        // 分類が不明な場合は本人名義に含める
        personalSongs.push(songData);
      }
    });

    // 各カテゴリの統計を計算
    const calculateStats = (songList) => {
      const songTypeStats = {};
      const releaseYearStats = {};
      
      songList.forEach(song => {
        if (song.songType) {
          songTypeStats[song.songType] = (songTypeStats[song.songType] || 0) + 1;
        }
        
        if (song.releaseYear) {
          releaseYearStats[song.releaseYear] = (releaseYearStats[song.releaseYear] || 0) + 1;
        }
      });

      const availableYears = Object.keys(releaseYearStats)
        .map(year => parseInt(year))
        .sort((a, b) => b - a);

      const availableSongTypes = Object.entries(songTypeStats)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count }));

      return {
        totalSongs: songList.length,
        songTypeStats,
        releaseYearStats,
        availableYears,
        availableSongTypes
      };
    };

    // レスポンスデータを整形
    const responseData = {
      character: {
        songs: characterSongs,
        stats: calculateStats(characterSongs)
      },
      personal: {
        songs: personalSongs,
        stats: calculateStats(personalSongs)
      },
      overall: {
        totalSongs: songs.length,
        characterSongs: characterSongs.length,
        personalSongs: personalSongs.length
      },
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Songs API error:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
}