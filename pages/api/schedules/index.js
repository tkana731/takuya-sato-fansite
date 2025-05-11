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

        // デバッグ用
        console.log("スケジュールAPI: 検索期間", {
            from: from ? new Date(from) : today,
            to: to ? new Date(to) : oneMonthLater
        });

        // クエリー条件の構築
        let whereCondition = {
            start_date: {
                gte: from ? new Date(from) : today,
                lte: to ? new Date(to) : oneMonthLater
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

        // データベースの構造をデバッグ
        if (schedules.length > 0) {
            console.log("スケジュールAPI: 最初のスケジュールの構造", JSON.stringify({
                id: schedules[0].id,
                title: schedules[0].title,
                category: schedules[0].category,
                venue: schedules[0].venue,
                broadcastStation: schedules[0].broadcastStation,
                performances: schedules[0].performances.length,
                performers: schedules[0].performers.length
            }));
        }

        // フロントエンドで利用しやすい形式に整形
        const formattedSchedules = schedules.map(schedule => {
            const startDate = schedule.start_date;
            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            const weekday = weekdays[startDate.getDay()];

            // カテゴリに応じてロケーション情報を選択
            const isBroadcast = schedule.category?.name === '生放送';
            const location = isBroadcast
                ? (schedule.broadcastStation ? schedule.broadcastStation.name : '')
                : (schedule.venue ? schedule.venue.name : '');

            // パフォーマンス情報を整形
            const timeInfo = schedule.performances.length > 0
                ? schedule.performances.map(p => p.displayStartTime).join(' / ')
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

            return {
                id: schedule.id,
                date: startDate.toISOString().split('T')[0],
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
        });

        console.log(`スケジュールAPI: ${formattedSchedules.length}件のフォーマット済みスケジュールを返します`);

        return res.status(200).json(formattedSchedules);
    } catch (error) {
        console.error('スケジュールの取得エラー:', error);
        return res.status(500).json({
            error: 'スケジュールの取得に失敗しました',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}