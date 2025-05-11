// pages/api/works/create.js
import prisma from '../../../lib/prisma';

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
        const newWork = await prisma.work.create({
            data: {
                title,
                category_id: categoryId,
                year: year ? parseInt(year) : null,
                description: description || null,
                officialUrl: officialUrl || null
            }
        });

        return res.status(201).json({
            success: true,
            data: newWork,
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