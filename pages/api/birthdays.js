import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // 今日の日付を取得
            const today = new Date();
            const month = today.getMonth() + 1; // 0-11 -> 1-12
            const day = today.getDate();

            // 誕生日が今日のキャラクターを検索
            const todayBirthday = `${month}/${day < 10 ? '0' + day : day}`; // MM/DD形式

            const birthdayCharacters = await prisma.role.findMany({
                where: {
                    birthday: todayBirthday,
                    workRoles: {
                        some: {} // 何らかの作品に関連付けられているロール
                    }
                },
                select: {
                    id: true,
                    name: true,
                    seriesName: true,
                    birthday: true,
                },
            });

            res.status(200).json(birthdayCharacters);
        } catch (error) {
            console.error('誕生日キャラクターの取得エラー:', error);
            res.status(500).json({ error: '誕生日キャラクターの取得に失敗しました' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}