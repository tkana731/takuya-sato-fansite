// pages/api/works/create.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { title, categoryId, year, description, officialUrl } = req.body;

    // バリデーション
    if (!title || !categoryId) {
        return res.status(400).json({
            success: false,
            message: 'タイトルとカテゴリは必須項目です'
        });
    }

    try {
        // 作品データを作成
        const { data: newWork, error } = await supabase
            .from('works')
            .insert([{
                title,
                category_id: categoryId,
                year: year ? parseInt(year) : null,
                description: description || null,
                official_url: officialUrl || null
            }])
            .select();

        if (error) {
            console.error('作品登録エラー:', error);
            throw error;
        }

        if (!newWork || newWork.length === 0) {
            throw new Error('作品の登録に失敗しました');
        }

        return res.status(201).json({
            success: true,
            data: newWork[0],
            message: '作品が正常に登録されました'
        });
    } catch (error) {
        console.error('作品登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: '作品の登録に失敗しました',
            error: error.message
        });
    }
}