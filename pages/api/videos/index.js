// pages/api/videos/index.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // クエリパラメータからオプションを取得
        const { limit, workId } = req.query;

        // 取得件数（デフォルトは3件）
        const takeCount = limit ? parseInt(limit) : 3;

        // 検索条件を構築
        const where = {};
        if (workId) {
            where.work_id = workId;
        }

        // Prismaを使用して動画を取得（最新のものから指定件数）
        const videos = await prisma.video.findMany({
            where,
            orderBy: {
                publishedAt: 'desc'
            },
            take: takeCount,
            include: {
                work: true
            }
        });

        // 動画が見つからない場合は空の配列を返す
        if (videos.length === 0) {
            return res.status(200).json([]);
        }

        // データを整形して返す
        const formattedVideos = videos.map(video => {
            // 日付をYYYY.MM.DD形式に整形
            const publishedDate = new Date(video.publishedAt);
            const formattedDate = `${publishedDate.getFullYear()}.${String(publishedDate.getMonth() + 1).padStart(2, '0')}.${String(publishedDate.getDate()).padStart(2, '0')}`;

            return {
                id: video.id,
                title: video.title,
                date: formattedDate,
                videoUrl: video.videoUrl,
                workId: video.work_id,
                workTitle: video.work?.title
            };
        });

        // 常に配列形式で返す（一貫性を持たせる）
        return res.status(200).json(formattedVideos);
    } catch (error) {
        console.error('動画データの取得エラー:', error);
        return res.status(500).json({
            success: false,
            error: '動画データの取得に失敗しました',
            message: error.message
        });
    }
}