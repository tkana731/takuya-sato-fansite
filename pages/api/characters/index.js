// pages/api/characters/index.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // クエリパラメータからフィルタリング条件を取得
            const { voiceActorId, search, hasBirthday } = req.query;

            // クエリの構築
            let query = supabase
                .from('mst_roles')
                .select(`
                    id,
                    name,
                    voice_actor_id,
                    birthday,
                    series_name,
                    actor:voice_actor_id (
                        id,
                        name
                    )
                `)
                .order('name');

            // 声優IDによるフィルタリング
            if (voiceActorId) {
                query = query.eq('voice_actor_id', voiceActorId);
            }

            // 誕生日の有無でフィルタリング
            if (hasBirthday === 'true') {
                query = query.not('birthday', 'is', null);
            } else if (hasBirthday === 'false') {
                query = query.is('birthday', null);
            }

            // 名前による検索
            if (search) {
                query = query.or(`name.ilike.%${search}%,series_name.ilike.%${search}%`);
            }

            // クエリの実行
            const { data: characters, error } = await query;

            if (error) throw error;

            return res.status(200).json({
                success: true,
                data: characters
            });
        } catch (error) {
            console.error('キャラクターデータの取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'キャラクターデータの取得に失敗しました',
                error: error.message
            });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, voiceActorId, birthday, seriesName } = req.body;

            // バリデーション
            if (!name || !voiceActorId) {
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

            // キャラクターを作成
            const { data: newCharacter, error } = await supabase
                .from('mst_roles')
                .insert([{
                    name,
                    voice_actor_id: voiceActorId,
                    birthday: birthday || null,
                    series_name: seriesName || null
                }])
                .select();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                data: newCharacter[0],
                message: 'キャラクターが正常に登録されました'
            });
        } catch (error) {
            console.error('キャラクター登録エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'キャラクターの登録に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}