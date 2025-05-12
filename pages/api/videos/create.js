// pages/api/videos/create.js
import { supabase } from '../../../lib/supabase';

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
        console.log(`動画登録リクエスト: タイトル=${title}, 公開日=${publishedAt}`);

        // 動画データを作成
        const { data: newVideo, error } = await supabase
            .from('videos')
            .insert([
                {
                    title,
                    video_url: videoUrl,
                    published_at: new Date(publishedAt).toISOString(),
                    work_id: workId || null
                }
            ])
            .select();

        if (error) {
            console.error('動画登録エラー:', error);
            throw error;
        }

        if (!newVideo || newVideo.length === 0) {
            throw new Error('動画の登録に失敗しました: データが返されませんでした');
        }

        console.log(`動画が正常に登録されました: ID=${newVideo[0].id}`);

        return res.status(201).json({
            success: true,
            data: newVideo[0],
            message: '動画が正常に登録されました'
        });
    } catch (error) {
        console.error('動画登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: '動画の登録に失敗しました',
            error: error.message,
            details: error.details || error.stack
        });
    }
}