// pages/api/schedules/index.js
import { fetchData } from '../../../lib/api-helpers';
import { formatDate, getWeekday } from '../../../lib/form-helpers';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { category, from, to } = req.query;

        // 現在のUTC時間を取得
        const utcNow = new Date();

        // 日本時間のオフセット（UTC+9時間）を計算
        const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換

        // UTC時間に9時間を追加して日本時間を取得
        const today = new Date(utcNow.getTime() + jstOffset);

        // from/toクエリパラメータを取得（必須）
        if (!from || !to) {
            return res.status(400).json({
                error: '検索期間（from/to）は必須パラメータです'
            });
        }

        // fromとtoのDateオブジェクトを作成
        const fromDate = new Date(from);
        const toDate = new Date(to);

        // ISO文字列に変換（日付部分のみを抽出）
        const fromDateStr = fromDate.toISOString().split('T')[0];
        const toDateStr = toDate.toISOString().split('T')[0];

        console.log("スケジュールAPI: 検索期間", {
            from: fromDateStr,
            to: toDateStr,
            jstNow: today.toISOString()
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
          start_datetime,
          end_datetime,
          is_all_day,
          description,
          official_url,
          category:category_id (id, name, color_code),
          venue:venue_id (id, name, prefecture_id (id, name)),
          broadcastStation:broadcast_station_id (id, name),
          performers:rel_schedule_performers (
            id,
            role_description,
            display_order,
            performer:performer_id (id, name, is_takuya_sato)
          )
        `,
                filters: {
                    start_datetime: { gte: fromDateStr + 'T00:00:00+09:00', lte: toDateStr + 'T23:59:59+09:00' },
                    ...categoryFilter
                },
                order: 'start_datetime'
            }
        );

        console.log(`スケジュールAPI: ${schedules?.length || 0}件のスケジュールが見つかりました`);

        // 取得したスケジュールから終了日を超えるものを除外
        const filteredByDateSchedules = schedules?.filter(schedule => {
            const startDate = new Date(schedule.start_datetime);
            const startDateStr = startDate.toISOString().split('T')[0];
            return startDateStr <= toDateStr;
        }) || [];

        console.log(`日付フィルタリング後: ${filteredByDateSchedules.length}件のスケジュール`);

        // フロントエンドで利用しやすい形式に整形
        const formattedSchedules = filteredByDateSchedules.map(schedule => {
            // start_datetimeはtimestamptzなので、既に正しいタイムゾーン情報を持っている
            const startDate = new Date(schedule.start_datetime);
            
            // 日本時間で日付と時刻を取得
            // Vercelのサーバーはタイムゾーンが異なる可能性があるため、
            // 日本時間に明示的に変換する
            const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換
            const jstDate = new Date(startDate.getTime() + jstOffset);
            
            // ISO文字列から日本時間の各要素を抽出
            const jstString = jstDate.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
            const [datePart, timePart] = jstString.split('T');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes] = timePart.split(':');
            
            const formattedDate = `${year}-${month}-${day}`;
            const timeInfo = `${hours}:${minutes}`;
            
            // 曜日計算も日本時間で行う
            const weekday = getWeekday(jstDate);

            // カテゴリに応じてロケーション情報を選択
            const isBroadcast = schedule.category?.name === '生放送';
            const location = isBroadcast
                ? (schedule.broadcastStation ? schedule.broadcastStation.name : '')
                : (schedule.venue ? schedule.venue.name : '');
            const prefecture = !isBroadcast && schedule.venue?.prefecture_id?.name || null;

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

            return {
                id: schedule.id,
                date: formattedDate,
                datetime: schedule.start_datetime,
                endDatetime: schedule.end_datetime,
                weekday: weekday,
                category: categoryCode,
                categoryName: schedule.category?.name || '',
                title: schedule.title,
                time: timeInfo,
                isAllDay: schedule.is_all_day || false,
                location: location,
                locationType: isBroadcast ? '放送/配信' : '会場',
                prefecture: prefecture,
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