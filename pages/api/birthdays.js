// pages/api/birthdays.js
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 今日の日付を取得
        const today = new Date();
        const month = today.getMonth() + 1; // 0-11 -> 1-12
        const day = today.getDate();

        // 誕生日が今日のキャラクターを検索 (MM/DD形式)
        const formattedBirthday = `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;

        const birthdayCharacters = await prisma.role.findMany({
            where: {
                birthday: formattedBirthday
            },
            select: {
                id: true,
                name: true,
                seriesName: true,
                birthday: true
            }
        });

        return res.status(200).json(birthdayCharacters);
    } catch (error) {
        console.error('誕生日キャラクターの取得エラー:', error);
        return res.status(500).json({ error: '誕生日キャラクターの取得に失敗しました' });
    }
}