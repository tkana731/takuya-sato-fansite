// pages/api/broadcast-stations/create.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, typeId, officialUrl } = req.body;

    // バリデーション
    if (!name || !typeId) {
        return res.status(400).json({ message: '必須項目が入力されていません' });
    }

    try {
        // 最大の表示順を取得
        const maxOrderStation = await prisma.broadcastStation.findFirst({
            orderBy: {
                displayOrder: 'desc'
            }
        });

        // 次の表示順を決定
        const nextOrder = maxOrderStation ? maxOrderStation.displayOrder + 1 : 1;

        // 放送局を登録
        const newStation = await prisma.broadcastStation.create({
            data: {
                name,
                typeId,
                officialUrl: officialUrl || null,
                displayOrder: nextOrder
            }
        });

        return res.status(201).json({
            success: true,
            data: newStation,
            message: '放送局/配信サイトが正常に登録されました'
        });
    } catch (error) {
        console.error('放送局登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: '放送局/配信サイトの登録に失敗しました',
            error: error.message
        });
    }
}