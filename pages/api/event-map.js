// pages/api/event-map.js
import { fetchData } from '../../lib/api-helpers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // スケジュールデータから都道府県別のイベント数を取得
    const { data: schedules } = await fetchData(
      'schedules',
      {
        select: `
          id,
          title,
          start_date,
          end_date,
          category:category_id (id, name),
          venue:venue_id (
            id, 
            name,
            prefecture:prefecture_id (name)
          ),
          broadcastStation:broadcast_station_id (id, name)
        `,
        order: 'start_date'
      }
    );

    if (!schedules) {
      return res.status(500).json({ message: 'データベースエラー' });
    }

    // 都道府県別にイベントを集計
    const prefectureMap = {};
    const prefectureList = [
      '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
      '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
      '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
      '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
      '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
      '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
      '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ];

    // 都道府県マップを初期化
    prefectureList.forEach(pref => {
      prefectureMap[pref] = {
        count: 0,
        events: []
      };
    });

    // スケジュールデータを都道府県別に分類（会場開催のイベントのみ）
    schedules.forEach(schedule => {
      let prefecture = null;
      let locationName = '';

      // カテゴリに応じてロケーション情報を取得
      const isBroadcast = schedule.category?.name === '生放送';
      
      // 生放送は除外（会場開催のイベントのみを対象とする）
      if (isBroadcast) {
        return;
      }
      
      if (schedule.venue) {
        locationName = schedule.venue.name;
        
        // venue.prefectureから都道府県名を取得
        if (schedule.venue.prefecture && schedule.venue.prefecture.name) {
          prefecture = schedule.venue.prefecture.name;
        } else {
          // フォールバック: venue.nameから都道府県を推測
          prefecture = prefectureList.find(pref => 
            locationName.includes(pref) || 
            locationName.includes(pref.replace(/[都道府県]/g, ''))
          );
        }
      }

      if (prefecture && prefectureMap[prefecture]) {
        prefectureMap[prefecture].count++;
        prefectureMap[prefecture].events.push({
          title: schedule.title,
          date: schedule.start_date,
          location: locationName,
          category: schedule.category?.name || '',
          id: schedule.id
        });
      }
    });

    // レスポンスデータを整形
    const responseData = {
      prefectures: Object.entries(prefectureMap).map(([name, data]) => ({
        name,
        count: data.count,
        totalEvents: data.events.length, // 総イベント数を追加
        events: data.events
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10) // 最新10件まで
      })).filter(pref => pref.count > 0), // イベントがある都道府県のみ
      totalEvents: schedules.filter(s => s.category?.name !== '生放送').length,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Event map API error:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
}