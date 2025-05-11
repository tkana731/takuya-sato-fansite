// pages/api/videos/create.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, workId, videoUrl, publishedAt } = req.body;

    // バリデーション
    if (!title || !videoUrl || !publishedAt) {
        return res.status(400).json({
            success: false,
            message: 'タイトル、動画URL、公開日は必須項目です'
        });
    }

    try {
        // 動画データを作成
        const newVideo = await prisma.video.create({
            data: {
                title,
                videoUrl,
                publishedAt: new Date(publishedAt),
                work: workId ? { connect: { id: workId } } : undefined
            }
        });

        return res.status(201).json({
            success: true,
            data: newVideo,
            message: '動画が正常に登録されました'
        });
    } catch (error) {
        console.error('動画登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: '動画の登録に失敗しました',
            error: error.message
        });
    }
}