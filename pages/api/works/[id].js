// pages/api/works/[id].js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: '作品IDが指定されていません'
        });
    }

    // GET: 作品取得
    if (req.method === 'GET') {
        try {
            // 作品データを取得
            const { data: work, error } = await supabase
                .from('works')
                .select(`
                    id, 
                    title, 
                    category_id,
                    year,
                    description, 
                    official_url,
                    category:category_id (id, name)
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('作品取得エラー:', error);
                throw error;
            }

            if (!work) {
                return res.status(404).json({
                    success: false,
                    message: '指定された作品が見つかりません'
                });
            }

            return res.status(200).json({
                success: true,
                data: work
            });
        } catch (error) {
            console.error('作品取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: '作品の取得に失敗しました',
                error: error.message
            });
        }
    }
    // PUT: 作品更新
    else if (req.method === 'PUT') {
        const { title, categoryId, year, description, officialUrl } = req.body;

        // バリデーション
        if (!title || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'タイトルとカテゴリは必須項目です'
            });
        }

        try {
            // 作品データを更新
            const { data: updatedWork, error } = await supabase
                .from('works')
                .update({
                    title,
                    category_id: categoryId,
                    year: year ? parseInt(year) : null,
                    description: description || null,
                    official_url: officialUrl || null
                })
                .eq('id', id)
                .select();

            if (error) {
                console.error('作品更新エラー:', error);
                throw error;
            }

            return res.status(200).json({
                success: true,
                data: updatedWork[0],
                message: '作品が正常に更新されました'
            });
        } catch (error) {
            console.error('作品更新エラー:', error);
            return res.status(500).json({
                success: false,
                message: '作品の更新に失敗しました',
                error: error.message
            });
        }
    }
    // DELETE: 作品削除
    else if (req.method === 'DELETE') {
        try {
            // まず、関連するデータがないかチェック
            const { data: workRoles, error: rolesError } = await supabase
                .from('rel_work_roles')
                .select('id')
                .eq('work_id', id);

            if (rolesError) throw rolesError;

            // 関連するロールがある場合、先にそれらを削除
            if (workRoles && workRoles.length > 0) {
                const { error: deleteRolesError } = await supabase
                    .from('rel_work_roles')
                    .delete()
                    .eq('work_id', id);

                if (deleteRolesError) throw deleteRolesError;
            }

            // 放送情報がある場合は削除
            const { data: broadcastChannels, error: channelsError } = await supabase
                .from('rel_broadcast_channels')
                .select('id')
                .eq('work_id', id);

            if (channelsError) throw channelsError;

            if (broadcastChannels && broadcastChannels.length > 0) {
                const { error: deleteChannelsError } = await supabase
                    .from('rel_broadcast_channels')
                    .delete()
                    .eq('work_id', id);

                if (deleteChannelsError) throw deleteChannelsError;
            }

            // 作品自体を削除
            const { error: deleteWorkError } = await supabase
                .from('works')
                .delete()
                .eq('id', id);

            if (deleteWorkError) throw deleteWorkError;

            return res.status(200).json({
                success: true,
                message: '作品が正常に削除されました'
            });
        } catch (error) {
            console.error('作品削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: '作品の削除に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}