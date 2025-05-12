// pages/api/roles/[id].js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: '役割IDが指定されていません'
        });
    }

    // GET: 役割取得
    if (req.method === 'GET') {
        try {
            // 役割データを取得
            const { data: role, error } = await supabase
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
                .eq('id', id)
                .single();

            if (error) throw error;

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: '指定された役割が見つかりません'
                });
            }

            return res.status(200).json({
                success: true,
                data: role
            });
        } catch (error) {
            console.error('役割取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割の取得に失敗しました',
                error: error.message
            });
        }
    }
    // PUT: 役割更新
    else if (req.method === 'PUT') {
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

            // 役割を更新
            const { data: updatedRole, error } = await supabase
                .from('mst_roles')
                .update({
                    name,
                    actor_id: actorId,
                    birthday: birthday || null,
                    series_name: seriesName || null
                })
                .eq('id', id)
                .select();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                data: updatedRole[0],
                message: '役割が正常に更新されました'
            });
        } catch (error) {
            console.error('役割更新エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割の更新に失敗しました',
                error: error.message
            });
        }
    }
    // DELETE: 役割削除
    else if (req.method === 'DELETE') {
        try {
            // 役割が作品に関連付けられていないかチェック
            const { data: relatedWorks, error: checkError } = await supabase
                .from('rel_work_roles')
                .select('id')
                .eq('role_id', id);

            if (checkError) throw checkError;

            // 関連付けがある場合は削除不可
            if (relatedWorks && relatedWorks.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `この役割は${relatedWorks.length}件の作品に関連付けられているため削除できません。先に関連を解除してください。`
                });
            }

            // 役割を削除
            const { error } = await supabase
                .from('mst_roles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({
                success: true,
                message: '役割が正常に削除されました'
            });
        } catch (error) {
            console.error('役割削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割の削除に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}