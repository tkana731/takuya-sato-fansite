// pages/api/videos/[id].js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: '動画IDが指定されていません'
        });
    }

    console.log(`動画API: ID=${id}, メソッド=${req.method}`);

    // GET: 動画取得
    if (req.method === 'GET') {
        try {
            // 動画データを取得
            const { data: video, error } = await supabase
                .from('videos')
                .select(`
                    id, 
                    title, 
                    video_url,
                    published_at,
                    work_id,
                    work:work_id (
                        id,
                        title
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('動画取得エラー:', error);
                throw error;
            }

            if (!video) {
                return res.status(404).json({
                    success: false,
                    message: '指定された動画が見つかりません'
                });
            }

            console.log(`動画取得成功: タイトル=${video.title}`);

            return res.status(200).json({
                success: true,
                data: {
                    id: video.id,
                    title: video.title,
                    videoUrl: video.video_url,
                    publishedAt: video.published_at,
                    work_id: video.work_id,
                    work: video.work
                }
            });
        } catch (error) {
            console.error('動画取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: '動画の取得に失敗しました',
                error: error.message,
                details: error.details || error.stack
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
            const { data: updatedVideo, error } = await supabase
                .from('videos')
                .update({
                    title,
                    video_url: videoUrl,
                    published_at: new Date(publishedAt).toISOString(),
                    work_id: workId || null
                })
                .eq('id', id)
                .select();

            if (error) {
                console.error('動画更新エラー:', error);
                throw error;
            }

            if (!updatedVideo || updatedVideo.length === 0) {
                throw new Error('動画の更新に失敗しました: データが返されませんでした');
            }

            console.log(`動画が正常に更新されました: ID=${id}`);

            return res.status(200).json({
                success: true,
                data: updatedVideo[0],
                message: '動画が正常に更新されました'
            });
        } catch (error) {
            console.error('動画更新エラー:', error);
            return res.status(500).json({
                success: false,
                message: '動画の更新に失敗しました',
                error: error.message,
                details: error.details || error.stack
            });
        }
    }
    // DELETE: 動画削除
    else if (req.method === 'DELETE') {
        try {
            // 動画を削除
            const { error } = await supabase
                .from('videos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('動画削除エラー:', error);
                throw error;
            }

            console.log(`動画が正常に削除されました: ID=${id}`);

            return res.status(200).json({
                success: true,
                message: '動画が正常に削除されました'
            });
        } catch (error) {
            console.error('動画削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: '動画の削除に失敗しました',
                error: error.message,
                details: error.details || error.stack
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}