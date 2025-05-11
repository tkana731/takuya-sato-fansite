// pages/api/works/[id]/roles/[roleId].js
import prisma from '../../../../../lib/prisma';

export default async function handler(req, res) {
    const { id, roleId } = req.query;

    if (!id || !roleId) {
        return res.status(400).json({
            success: false,
            message: '作品IDと役割IDが必要です'
        });
    }

    // DELETE: 作品の役割を削除
    if (req.method === 'DELETE') {
        try {
            // 役割情報を削除
            await prisma.workRole.delete({
                where: {
                    id: roleId
                }
            });

            return res.status(200).json({
                success: true,
                message: '役割情報が正常に削除されました'
            });
        } catch (error) {
            console.error('役割情報削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: '役割情報の削除に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}