// pages/api/works/[id]/roles.js
import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: '作品IDが指定されていません'
        });
    }

    // POST: 作品の役割を追加
    if (req.method === 'POST') {
        const { roleId, isMainRole } = req.body;

        if (!roleId) {
            return res.status(400).json({
                success: false,
                message: '役割IDが指定されていません'
            });
        }

        try {
            // 重複チェック - 同じ作品に同じ役割が既に登録されていないか確認
            const { data: existingRole, error: checkError } = await supabase
                .from('rel_work_roles')
                .select('id')
                .eq('work_id', id)
                .eq('role_id', roleId);

            if (checkError) throw checkError;

            if (existingRole && existingRole.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'この役割は既に追加されています'
                });
            }

            // 最大の表示順を取得
            const { data: maxOrderRole, error: orderError } = await supabase
                .from('rel_work_roles')
                .select('display_order')
                .eq('work_id', id)
                .order('display_order', { ascending: false })
                .limit(1);

            if (orderError) throw orderError;

            // 次の表示順を決定
            const nextOrder = maxOrderRole && maxOrderRole.length > 0 ? maxOrderRole[0].display_order + 1 : 1;

            // 役割情報を追加
            const { data: newRole, error: insertError } = await supabase
                .from('rel_work_roles')
                .insert([{
                    work_id: id,
                    role_id: roleId,
                    is_main_role: isMainRole || false,
                    display_order: nextOrder
                }])
                .select(`
                    id,
                    work_id,
                    role_id,
                    is_main_role,
                    display_order,
                    role:role_id (
                        id,
                        name,
                        series_name
                    )
                `);

            if (insertError) throw insertError;

            if (!newRole || newRole.length === 0) {
                throw new Error('役割情報の追加に失敗しました');
            }

            return res.status(201).json({
                success: true,
                data: newRole[0],
                message: '役割情報が正常に追加されました'
            });
        } catch (error) {
            console.error('役割情報追加エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割情報の追加に失敗しました',
                error: error.message
            });
        }
    }

    // GET: 作品の役割を取得
    else if (req.method === 'GET') {
        try {
            // 役割情報を取得
            const { data: roles, error } = await supabase
                .from('rel_work_roles')
                .select(`
                    id,
                    work_id,
                    role_id,
                    is_main_role,
                    display_order,
                    role:role_id (
                        id,
                        name,
                        series_name
                    )
                `)
                .eq('work_id', id)
                .order('display_order', { ascending: true });

            if (error) throw error;

            return res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('役割情報取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割情報の取得に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}