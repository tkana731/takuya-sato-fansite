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

        // クエリー条件の構築
        let whereCondition = {
            start_date: {
                gte: from ? new Date(from) : today,
                lte: to ? new Date(to) : oneMonthLater
            }
        };

        // カテゴリーが指定されている場合は条件に追加
        if (category && category !== 'all') {
            whereCondition.category = {
                name: category === 'event' ? 'イベント' :
                    category === 'stage' ? '舞台・朗読' :
                        category === 'broadcast' ? '生放送' : undefined
            };
        }

        // Prismaでスケジュールを取得
        const schedules = await prisma.schedule.findMany({
            where: whereCondition,
            include: {
                category: true,
                venue: true,
                broadcastStation: true,
                performances: {
                    orderBy: {
                        displayOrder: 'asc'
                    }
                },
                schedulePerformers: {
                    include: {
                        performer: true
                    },
                    orderBy: {
                        displayOrder: 'asc'
                    }
                }
            },
            orderBy: {
                start_date: 'asc'
            }
        });

        // フロントエンドで利用しやすい形式に整形
        const formattedSchedules = schedules.map(schedule => {
            const startDate = schedule.start_date;
            const weekday = ['日', '月', '火', '水', '木', '金', '土'][startDate.getDay()];

            // カテゴリに応じてロケーション情報を選択
            const isBroadcast = schedule.category.name === '生放送';
            const location = isBroadcast
                ? (schedule.broadcastStation ? schedule.broadcastStation.name : '')
                : (schedule.venue ? schedule.venue.name : '');

            // パフォーマンス情報を整形
            const timeInfo = schedule.performances.length > 0
                ? schedule.performances.map(p => p.displayStartTime).join(' / ')
                : 'TBD';

            // 出演者情報を整形
            const performers = schedule.schedulePerformers.map(p => p.performer.name).join('、');
            const description = schedule.description || (performers ? `出演：${performers}` : '');

            return {
                id: schedule.id,
                date: startDate.toISOString().split('T')[0],
                weekday: weekday,
                category: schedule.category.name === 'イベント' ? 'event' :
                    schedule.category.name === '舞台・朗読' ? 'stage' :
                        schedule.category.name === '生放送' ? 'broadcast' : 'other',
                categoryName: schedule.category.name,
                title: schedule.title,
                time: timeInfo,
                location: location,
                locationType: isBroadcast ? '放送/配信' : '会場',
                description: description,
                link: schedule.official_url || '#'
            };
        });

        return res.status(200).json(formattedSchedules);
    } catch (error) {
        console.error('スケジュールの取得エラー:', error);
        return res.status(500).json({ error: 'スケジュールの取得に失敗しました' });
    }
}