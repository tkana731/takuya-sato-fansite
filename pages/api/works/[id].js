// pages/api/works/[id].js
import prisma from '../../../lib/prisma';

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
            const work = await prisma.work.findUnique({
                where: {
                    id: id
                },
                include: {
                    category: true
                }
            });

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
            const updatedWork = await prisma.work.update({
                where: {
                    id: id
                },
                data: {
                    title,
                    category_id: categoryId,
                    year: year ? parseInt(year) : null,
                    description: description || null,
                    officialUrl: officialUrl || null
                }
            });

            return res.status(200).json({
                success: true,
                data: updatedWork,
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
            // トランザクションで関連データも含めて削除
            await prisma.$transaction(async (tx) => {
                // 作品に関連する役割情報を削除
                await tx.workRole.deleteMany({
                    where: {
                        work_id: id
                    }
                });

                // 放送情報を削除（もし存在すれば）
                await tx.broadcastChannel.deleteMany({
                    where: {
                        workId: id
                    }
                });

                // 作品自体を削除
                await tx.work.delete({
                    where: {
                        id: id
                    }
                });
            });

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