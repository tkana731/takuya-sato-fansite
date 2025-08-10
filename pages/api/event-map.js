// pages/api/event-map.js
import { fetchData } from '../../lib/api-helpers';
import { processScheduleTimeInfo, getCategoryCode, getLocationInfo } from '../../utils/scheduleUtils';

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
          start_datetime,
          end_datetime,
          is_all_day,
          category:category_id (id, name, color_code),
          venue:venue_id (
            id, 
            name,
            prefecture:prefecture_id (name)
          ),
          broadcastStation:broadcast_station_id (id, name),
          performers:rel_schedule_performers (
            id,
            role_description,
            performer:performer_id (id, name, is_takuya_sato)
          )
        `,
        order: 'start_datetime'
      }
    );

    if (!schedules) {
      return res.status(500).json({ message: 'データベースエラー' });
    }

    // 都道府県別にイベントを集計
    const prefectureMap = {};
    const yearlyData = {}; // 年別のデータを保持
    const performerStats = {}; // 共演者統計データ
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
        events: [],
        yearlyBreakdown: {} // 年別の内訳を追加
      };
    });

    // スケジュールデータを都道府県別に分類（会場開催のイベントのみ）
    schedules.forEach(schedule => {
      let prefecture = null;
      let locationName = '';

      // カテゴリに応じてロケーション情報を取得
      const isBroadcast = schedule.category?.name === '生放送';
      const isVoiceGuide = schedule.category?.name === '音声ガイド';
      
      // 生放送と音声ガイドは除外（会場開催のイベントのみを対象とする）
      if (isBroadcast || isVoiceGuide) {
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
        // 共通の時間処理関数を使用
        const timeProcessing = processScheduleTimeInfo(schedule);
        const eventYear = timeProcessing.jstDate.getFullYear();
        
        // 年別データの集計
        if (!yearlyData[eventYear]) {
          yearlyData[eventYear] = 0;
        }
        yearlyData[eventYear]++;
        
        // 都道府県ごとの年別集計
        if (!prefectureMap[prefecture].yearlyBreakdown[eventYear]) {
          prefectureMap[prefecture].yearlyBreakdown[eventYear] = 0;
        }
        prefectureMap[prefecture].yearlyBreakdown[eventYear]++;
        
        prefectureMap[prefecture].count++;
        prefectureMap[prefecture].events.push({
          title: schedule.title,
          date: schedule.start_datetime,
          location: locationName,
          category: schedule.category?.name || '',
          categoryColor: schedule.category?.color_code || null,
          time: timeProcessing.timeInfo,
          isAllDay: schedule.is_all_day || false,
          year: eventYear,
          id: schedule.id,
          performers: schedule.performers?.map(p => ({
            name: p.performer?.name,
            role: p.role_description,
            isTakuyaSato: p.performer?.is_takuya_sato
          })) || []
        });

        // 共演者統計の集計（佐藤拓也さんが出演するイベントのみ）
        const hasTakuyaSato = schedule.performers?.some(p => p.performer?.is_takuya_sato);
        if (hasTakuyaSato && schedule.performers?.length > 1) {
          schedule.performers.forEach(performer => {
            if (performer.performer && !performer.performer.is_takuya_sato) {
              const performerName = performer.performer.name;
              
              if (!performerStats[performerName]) {
                performerStats[performerName] = {
                  name: performerName,
                  count: 0,
                  events: [],
                  yearlyBreakdown: {}
                };
              }
              
              performerStats[performerName].count++;
              performerStats[performerName].events.push({
                title: schedule.title,
                date: schedule.start_datetime,
                location: locationName,
                prefecture: prefecture,
                category: schedule.category?.name || '',
                year: eventYear,
                role: performer.role_description || null
              });
              
              // 年別集計
              if (!performerStats[performerName].yearlyBreakdown[eventYear]) {
                performerStats[performerName].yearlyBreakdown[eventYear] = 0;
              }
              performerStats[performerName].yearlyBreakdown[eventYear]++;
            }
          });
        }
      }
    });

    // 年のリストを作成（降順）
    const availableYears = Object.keys(yearlyData).map(year => parseInt(year)).sort((a, b) => b - a);
    
    // 全イベントのリストを作成（開催日降順）
    const allEvents = [];
    Object.entries(prefectureMap).forEach(([prefName, data]) => {
      data.events.forEach(event => {
        allEvents.push({
          ...event,
          prefecture: prefName
        });
      });
    });
    
    // 開催日の降順でソート
    allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 共演者統計データの整形
    const performerStatsArray = Object.values(performerStats)
      .sort((a, b) => b.count - a.count)
      .map(performer => ({
        ...performer,
        events: performer.events
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5) // 最新5件まで
      }));

    // レスポンスデータを整形
    const responseData = {
      prefectures: Object.entries(prefectureMap).map(([name, data]) => ({
        name,
        count: data.count,
        totalEvents: data.events.length,
        yearlyBreakdown: data.yearlyBreakdown,
        events: data.events
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10) // 最新10件まで
      })), // 全ての都道府県を返す（0件も含む）
      allEvents: allEvents, // 全イベントリストを追加
      performerStats: performerStatsArray, // 共演者統計を追加
      totalEvents: schedules.filter(s => s.category?.name !== '生放送').length,
      yearlyData: yearlyData,
      availableYears: availableYears,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Event map API error:', error);
    res.status(500).json({ message: 'サーバーエラー' });
  }
}