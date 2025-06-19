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
          lyricist:lyricist_id (
            id,
            name
          ),
          composer:composer_id (
            id,
            name
          ),
          arranger:arranger_id (
            id,
            name
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
    
    songs.forEach(song => {
      const songData = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        songType: song.song_type,
        releaseDate: song.release_date,
        description: song.description,
        lyricist: song.lyricist?.name || null,
        composer: song.composer?.name || null,
        arranger: song.arranger?.name || null,
        releaseYear: song.release_date ? new Date(song.release_date).getFullYear() : null
      };
      
      if (characterSongTypes.includes(song.song_type)) {
        characterSongs.push(songData);
      } else if (personalSongTypes.includes(song.song_type)) {
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