// pages/api/works/[id]/roles.js
import prisma from '../../../../lib/prisma';

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
            const existingRole = await prisma.workRole.findFirst({
                where: {
                    work_id: id,
                    role_id: roleId
                }
            });

            if (existingRole) {
                return res.status(400).json({
                    success: false,
                    message: 'この役割は既に追加されています'
                });
            }

            // 最大の表示順を取得
            const maxOrderRole = await prisma.workRole.findFirst({
                where: {
                    work_id: id
                },
                orderBy: {
                    display_order: 'desc'
                }
            });

            // 次の表示順を決定
            const nextOrder = maxOrderRole ? maxOrderRole.display_order + 1 : 1;

            // 役割情報を追加
            const newRole = await prisma.workRole.create({
                data: {
                    work_id: id,
                    role_id: roleId,
                    is_main_role: isMainRole || false,
                    display_order: nextOrder
                },
                include: {
                    role: true
                }
            });

            return res.status(201).json({
                success: true,
                data: newRole,
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
            const roles = await prisma.workRole.findMany({
                where: {
                    work_id: id
                },
                include: {
                    role: true
                },
                orderBy: {
                    display_order: 'asc'
                }
            });

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