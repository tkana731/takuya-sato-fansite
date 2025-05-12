// pages/api/roles/index.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // クエリパラメータからフィルタリング条件を取得
            const { actorId, search } = req.query;

            // クエリ条件を作成
            let query = supabase
                .from('mst_roles')
                .select(`
                    id,
                    name,
                    actor_id,
                    birthday,
                    series_name,
                    actor:actor_id (
                        id,
                        name
                    )
                `)
                .order('name');

            // 声優IDによるフィルタリング
            if (actorId) {
                query = query.eq('actor_id', actorId);
            }

            // 名前による検索
            if (search) {
                query = query.or(`name.ilike.%${search}%,series_name.ilike.%${search}%`);
            }

            const { data: roles, error } = await query;

            if (error) throw error;

            return res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('役割データの取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割データの取得に失敗しました',
                error: error.message
            });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, actorId, birthday, seriesName } = req.body;

            // バリデーション
            if (!name || !actorId) {
                return res.status(400).json({
                    success: false,
                    message: '名前と声優は必須項目です'
                });
            }

            // 誕生日のバリデーション（存在する場合）
            if (birthday) {
                const birthdayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
                if (!birthdayRegex.test(birthday)) {
                    return res.status(400).json({
                        success: false,
                        message: '誕生日はMM/DD形式（例:05/15）で入力してください'
                    });
                }
            }

            // 役割を作成
            const { data: newRole, error } = await supabase
                .from('mst_roles')
                .insert([{
                    name,
                    actor_id: actorId,
                    birthday: birthday || null,
                    series_name: seriesName || null
                }])
                .select();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                data: newRole[0],
                message: '役割が正常に登録されました'
            });
        } catch (error) {
            console.error('役割登録エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割の登録に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}