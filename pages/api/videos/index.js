// pages/api/videos/index.js
import { supabase } from '../../../lib/supabase';

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
        let query = supabase
            .from('videos')
            .select(`
                id,
                title,
                video_url,
                published_at,
                work:work_id (
                    id,
                    title
                )
            `)
            .order('published_at', { ascending: false })
            .limit(takeCount);

        // workIdによるフィルタリング
        if (workId) {
            query = query.eq('work_id', workId);
        }

        // クエリ実行
        const { data: videos, error } = await query;

        if (error) {
            console.error('動画データ取得エラー:', error);
            throw error;
        }

        // 動画が見つからない場合は空の配列を返す
        if (!videos || videos.length === 0) {
            console.log('動画が見つかりませんでした');
            return res.status(200).json([]);
        }

        console.log(`${videos.length}件の動画を取得しました`);

        // データを整形して返す
        const formattedVideos = videos.map(video => {
            // 日付をYYYY.MM.DD形式に整形
            const publishedDate = new Date(video.published_at);
            const formattedDate = `${publishedDate.getFullYear()}.${String(publishedDate.getMonth() + 1).padStart(2, '0')}.${String(publishedDate.getDate()).padStart(2, '0')}`;

            return {
                id: video.id,
                title: video.title,
                date: formattedDate,
                videoUrl: video.video_url,
                workId: video.work?.id,
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
            message: error.message,
            details: error.details || error.stack
        });
    }
}