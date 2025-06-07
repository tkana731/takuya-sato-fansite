import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { platform, hasPhoto, hasVideo, workId } = req.query;

        let query = supabase
            .from('social_posts')
            .select(`
                id,
                platform,
                post_url,
                has_photo,
                has_video,
                published_at,
                work:work_id (
                    id,
                    title
                )
            `)
            .order('published_at', { ascending: false });

        if (platform) {
            query = query.eq('platform', platform);
        }

        if (hasPhoto === 'true') {
            query = query.eq('has_photo', true);
        }

        if (hasVideo === 'true') {
            query = query.eq('has_video', true);
        }

        if (workId) {
            query = query.eq('work_id', workId);
        }

        const { data: socialPosts, error } = await query;

        if (error) {
            console.error('ソーシャル投稿取得エラー:', error);
            throw error;
        }

        const formattedPosts = socialPosts.map(post => ({
            id: post.id,
            platform: post.platform,
            postUrl: post.post_url,
            hasPhoto: post.has_photo,
            hasVideo: post.has_video,
            publishedAt: post.published_at,
            work: post.work
        }));

        return res.status(200).json(formattedPosts);
    } catch (error) {
        console.error('ソーシャル投稿データの取得エラー:', error);
        return res.status(500).json({
            error: 'ソーシャル投稿データの取得に失敗しました',
            message: error.message
        });
    }
}