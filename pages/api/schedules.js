// pages/api/schedules.js
import prisma from '../../lib/prisma';

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
            startDate: {
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

        // スケジュールを取得
        const schedules = await prisma.schedule.findMany({
            where: whereCondition,
            include: {
                category: true,
                venue: true,
                performances: {
                    orderBy: {
                        performanceDate: 'asc'
                    }
                },
                performers: {
                    include: {
                        performer: true
                    },
                    orderBy: {
                        displayOrder: 'asc'
                    }
                }
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        // フロントエンドで利用しやすい形式に整形
        const formattedSchedules = schedules.map(schedule => {
            const startDate = schedule.startDate;
            const weekday = ['日', '月', '火', '水', '木', '金', '土'][startDate.getDay()];

            return {
                id: schedule.id,
                date: startDate.toISOString().split('T')[0],
                weekday: weekday,
                category: schedule.category.name === 'イベント' ? 'event' :
                    schedule.category.name === '舞台・朗読' ? 'stage' :
                        schedule.category.name === '生放送' ? 'broadcast' : 'other',
                categoryName: schedule.category.name,
                title: schedule.title,
                time: schedule.performances.length > 0 ?
                    schedule.performances.map(p => p.displayStartTime).join(' / ') :
                    'TBD',
                location: schedule.venue.name,
                description: schedule.description ||
                    (schedule.performers.length > 0 ?
                        `出演：${schedule.performers.map(p => p.performer.name).join('、')}` : ''),
                link: schedule.officialUrl || '#'
            };
        });

        return res.status(200).json(formattedSchedules);
    } catch (error) {
        console.error('スケジュールの取得エラー:', error);
        return res.status(500).json({ error: 'スケジュールの取得に失敗しました' });
    }
}