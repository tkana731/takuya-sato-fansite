// pages/api/videos.js
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 動画を取得（最新のものを1件）
        const videos = await prisma.video.findMany({
            orderBy: {
                publishedAt: 'desc'
            },
            take: 1
        });

        if (videos.length === 0) {
            return res.status(200).json([]);
        }

        const video = videos[0];
        // 日付をYYYY.MM.DD形式に整形
        const publishedDate = new Date(video.publishedAt);
        const formattedDate = `${publishedDate.getFullYear()}.${String(publishedDate.getMonth() + 1).padStart(2, '0')}.${String(publishedDate.getDate()).padStart(2, '0')}`;

        return res.status(200).json({
            id: video.id,
            title: video.title,
            date: formattedDate,
            videoUrl: video.videoUrl
        });
    } catch (error) {
        console.error('動画データの取得エラー:', error);
        return res.status(500).json({ error: '動画データの取得に失敗しました' });
    }
}