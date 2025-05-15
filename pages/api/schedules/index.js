// pages/api/schedules/index.js
import { fetchData } from '../../../lib/api-helpers';
import { formatDate, getWeekday } from '../../../lib/form-helpers';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { category, from, to } = req.query;

        // 今日から1ヶ月後までのスケジュールをデフォルトで取得
        const today = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(today.getMonth() + 1);

        // 検索期間の設定
        const fromDate = from ? new Date(from) : today;
        const toDate = to ? new Date(to) : oneMonthLater;

        // ISO文字列に変換（日付部分のみを抽出）
        const fromDateStr = fromDate.toISOString().split('T')[0];
        const toDateStr = toDate.toISOString().split('T')[0];

        console.log("スケジュールAPI: 検索期間", {
            from: fromDateStr,
            to: toDateStr
        });

        // カテゴリフィルタリングの準備
        let categoryFilter = {};
        if (category && category !== 'all') {
            const categoryMapping = {
                'event': 'イベント',
                'stage': '舞台・朗読',
                'broadcast': '生放送'
            };

            if (categoryMapping[category]) {
                // カテゴリIDを取得するサブクエリ
                const { data: categoryData } = await fetchData(
                    'mst_schedule_categories',
                    {
                        select: 'id',
                        filters: { name: categoryMapping[category] },
                        single: true
                    }
                );

                if (categoryData?.id) {
                    categoryFilter = { category_id: categoryData.id };
                }
            }
        }

        // スケジュールデータ取得
        const { data: schedules } = await fetchData(
            'schedules',
            {
                select: `
          id,
          title,
          start_date,
          end_date,
          is_all_day,
          description,
          official_url,
          category:category_id (id, name, color_code),
          venue:venue_id (id, name),
          broadcastStation:broadcast_station_id (id, name),
          performances:rel_schedule_performances (
            id,
            performance_date,
            display_start_time,
            display_end_time,
            subtitle,
            description,
            display_order
          ),
          performers:rel_schedule_performers (
            id,
            role_description,
            display_order,
            performer:performer_id (id, name, is_takuya_sato)
          )
        `,
                filters: {
                    start_date: { gte: fromDateStr },
                    ...categoryFilter
                },
                order: 'start_date'
            }
        );

        console.log(`スケジュールAPI: ${schedules?.length || 0}件のスケジュールが見つかりました`);

        // 取得したスケジュールから終了日を超えるものを除外
        const filteredByDateSchedules = schedules?.filter(schedule => {
            const startDate = new Date(schedule.start_date);
            return startDate <= toDate;
        }) || [];

        console.log(`日付フィルタリング後: ${filteredByDateSchedules.length}件のスケジュール`);

        // フロントエンドで利用しやすい形式に整形
        const formattedSchedules = filteredByDateSchedules.map(schedule => {
            // Dateオブジェクトを確実に作成
            const startDate = new Date(schedule.start_date);
            const weekday = getWeekday(startDate);

            // カテゴリに応じてロケーション情報を選択
            const isBroadcast = schedule.category?.name === '生放送';
            const location = isBroadcast
                ? (schedule.broadcastStation ? schedule.broadcastStation.name : '')
                : (schedule.venue ? schedule.venue.name : '');

            // パフォーマンス情報を整形
            const timeInfo = schedule.performances.length > 0
                ? schedule.performances
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(p => p.display_start_time)
                    .join(' / ')
                : 'TBD';

            // 出演者情報を整形
            const performers = schedule.performers
                .filter(p => p.performer)
                .map(p => p.performer.name)
                .join('、');

            const description = schedule.description || (performers ? `出演：${performers}` : '');

            // カテゴリコード変換
            const categoryCode = schedule.category?.name === 'イベント' ? 'event' :
                schedule.category?.name === '舞台・朗読' ? 'stage' :
                    schedule.category?.name === '生放送' ? 'broadcast' : 'other';

            // 日付をYYYY-MM-DD形式に整形
            const formattedDate = startDate.toISOString().split('T')[0];

            return {
                id: schedule.id,
                date: formattedDate,
                weekday: weekday,
                category: categoryCode,
                categoryName: schedule.category?.name || '',
                title: schedule.title,
                time: timeInfo,
                location: location,
                locationType: isBroadcast ? '放送/配信' : '会場',
                description: description,
                link: schedule.official_url || '#'
            };
        }) || [];

        // 検索期間のフォーマット
        const formatDateForDisplay = (date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}.${month}.${day}`;
        };

        // レスポンス形式を変更し、期間情報を含める
        const response = {
            period: {
                from: formatDateForDisplay(fromDate),
                to: formatDateForDisplay(toDate),
                formatted: `${formatDateForDisplay(fromDate)} - ${formatDateForDisplay(toDate)}`
            },
            schedules: formattedSchedules
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('スケジュールの取得エラー:', error);

        // より詳細なエラー情報を返す
        return res.status(500).json({
            error: 'スケジュールの取得に失敗しました',
            message: error.message,
            details: error.details || error.stack
        });
    }
}