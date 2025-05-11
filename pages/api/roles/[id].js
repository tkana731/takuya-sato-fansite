// pages/api/roles/[id].js
import prisma from '../../../lib/prisma';

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
            const role = await prisma.role.findUnique({
                where: {
                    id: id
                },
                include: {
                    actor: true
                }
            });

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
            const updatedRole = await prisma.role.update({
                where: {
                    id: id
                },
                data: {
                    name,
                    actorId,
                    birthday: birthday || null,
                    seriesName: seriesName || null
                }
            });

            return res.status(200).json({
                success: true,
                data: updatedRole,
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
            const relatedWorks = await prisma.workRole.findMany({
                where: {
                    role_id: id
                }
            });

            // 関連付けがある場合は削除不可
            if (relatedWorks.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `この役割は${relatedWorks.length}件の作品に関連付けられているため削除できません。先に関連を解除してください。`
                });
            }

            // 役割を削除
            await prisma.role.delete({
                where: {
                    id: id
                }
            });

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