import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // URLクエリパラメータから取得
            const { category, from, to } = req.query;

            // クエリ条件の構築
            let whereCondition = {};

            if (category) {
                whereCondition.categoryId = category;
            }

            if (from && to) {
                whereCondition.startDate = {
                    gte: new Date(from),
                    lte: new Date(to),
                };
            }

            // スケジュールデータの取得
            const schedules = await prisma.schedule.findMany({
                where: whereCondition,
                include: {
                    category: true,
                    venue: true,
                    performances: {
                        orderBy: {
                            performanceDate: 'asc',
                        },
                    },
                    performers: {
                        include: {
                            performer: true,
                        },
                        orderBy: {
                            displayOrder: 'asc',
                        },
                    },
                },
                orderBy: {
                    startDate: 'asc',
                },
            });

            res.status(200).json(schedules);
        } catch (error) {
            console.error('スケジュールの取得エラー:', error);
            res.status(500).json({ error: 'スケジュールの取得に失敗しました' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}