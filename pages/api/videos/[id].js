// pages/api/videos/[id].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: '動画IDが指定されていません'
        });
    }

    // GET: 動画取得
    if (req.method === 'GET') {
        try {
            // 動画データを取得
            const video = await prisma.video.findUnique({
                where: {
                    id: id
                },
                include: {
                    work: true
                }
            });

            if (!video) {
                return res.status(404).json({
                    success: false,
                    message: '指定された動画が見つかりません'
                });
            }

            return res.status(200).json({
                success: true,
                data: video
            });
        } catch (error) {
            console.error('動画取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: '動画の取得に失敗しました',
                error: error.message
            });
        }
    }
    // PUT: 動画更新
    else if (req.method === 'PUT') {
        const { title, workId, videoUrl, publishedAt } = req.body;

        // バリデーション
        if (!title || !videoUrl || !publishedAt) {
            return res.status(400).json({
                success: false,
                message: 'タイトル、動画URL、公開日は必須項目です'
            });
        }

        try {
            // 動画データを更新
            const updatedVideo = await prisma.video.update({
                where: {
                    id: id
                },
                data: {
                    title,
                    videoUrl,
                    publishedAt: new Date(publishedAt),
                    work: workId
                        ? { connect: { id: workId } }
                        : { disconnect: true }
                }
            });

            return res.status(200).json({
                success: true,
                data: updatedVideo,
                message: '動画が正常に更新されました'
            });
        } catch (error) {
            console.error('動画更新エラー:', error);
            return res.status(500).json({
                success: false,
                message: '動画の更新に失敗しました',
                error: error.message
            });
        }
    }
    // DELETE: 動画削除
    else if (req.method === 'DELETE') {
        try {
            // 動画を削除
            await prisma.video.delete({
                where: {
                    id: id
                }
            });

            return res.status(200).json({
                success: true,
                message: '動画が正常に削除されました'
            });
        } catch (error) {
            console.error('動画削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: '動画の削除に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}