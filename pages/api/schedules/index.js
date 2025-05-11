// pages/api/schedules/index.js
import prisma from '../../../lib/prisma';

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

        // デバッグ用
        console.log("スケジュールAPI: 検索期間", {
            from: fromDateStr,
            to: toDateStr
        });

        // クエリー条件の構築 - 文字列で日付範囲を指定
        let whereCondition = {
            start_date: {
                gte: new Date(fromDateStr),
                lte: new Date(toDateStr + 'T23:59:59.999Z')
            }
        };

        // カテゴリーが指定されている場合は条件に追加
        if (category && category !== 'all') {
            const categoryNameMap = {
                'event': 'イベント',
                'stage': '舞台・朗読',
                'broadcast': '生放送'
            };

            const categoryName = categoryNameMap[category];

            if (categoryName) {
                whereCondition.category = {
                    name: categoryName
                };
            }
        }

        console.log("スケジュールAPI: 検索条件", JSON.stringify(whereCondition));

        // Prismaでスケジュールを取得
        const schedules = await prisma.schedule.findMany({
            where: whereCondition,
            include: {
                category: true,
                venue: true,
                broadcastStation: true,
                performances: {
                    orderBy: {
                        display_order: 'asc'
                    }
                },
                performers: {
                    include: {
                        performer: true
                    },
                    orderBy: {
                        display_order: 'asc'
                    }
                }
            },
            orderBy: {
                start_date: 'asc'
            }
        });

        console.log(`スケジュールAPI: ${schedules.length}件のスケジュールが見つかりました`);

        // デバッグ情報
        if (schedules.length > 0) {
            console.log("スケジュールAPI: 最初のスケジュールの情報", {
                id: schedules[0].id,
                title: schedules[0].title,
                startDate: schedules[0].start_date,
                categoryName: schedules[0].category?.name
            });
        }

        // フロントエンドで利用しやすい形式に整形
        const formattedSchedules = schedules.map(schedule => {
            // Dateオブジェクトを確実に作成
            const startDate = new Date(schedule.start_date);
            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            const weekday = weekdays[startDate.getDay()];

            // カテゴリに応じてロケーション情報を選択
            const isBroadcast = schedule.category?.name === '生放送';
            const location = isBroadcast
                ? (schedule.broadcastStation ? schedule.broadcastStation.name : '')
                : (schedule.venue ? schedule.venue.name : '');

            // パフォーマンス情報を整形
            const timeInfo = schedule.performances.length > 0
                ? schedule.performances.map(p => p.display_start_time).join(' / ')
                : 'TBD';

            // 出演者情報を整形
            const performers = schedule.performers
                .map(p => p.performer?.name)
                .filter(Boolean)
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
                link: schedule.officialUrl || '#'
            };
        });

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

        console.log(`スケジュールAPI: 期間情報を含めて${formattedSchedules.length}件のフォーマット済みスケジュールを返します`);

        return res.status(200).json(response);
    } catch (error) {
        console.error('スケジュールの取得エラー:', error);

        // より詳細なエラー情報を返す
        return res.status(500).json({
            error: 'スケジュールの取得に失敗しました',
            message: error.message,
            name: error.name,
            code: error.code,
            meta: error.meta,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}