// pages/api/venues/create.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, postalCode, prefectureId, address, capacity, officialUrl, googleMapsUrl } = req.body;

    // バリデーション
    if (!name || !prefectureId) {
        return res.status(400).json({ message: '必須項目が入力されていません' });
    }

    try {
        // 最大の表示順を取得
        const maxOrderVenue = await prisma.venue.findFirst({
            orderBy: {
                display_order: 'desc'
            }
        });

        // 次の表示順を決定
        const nextOrder = maxOrderVenue ? maxOrderVenue.display_order + 1 : 1;

        // 会場を登録
        const newVenue = await prisma.venue.create({
            data: {
                name,
                postal_code: postalCode || null,
                address: address || null,
                capacity: capacity || null,
                official_url: officialUrl || null,
                google_maps_url: googleMapsUrl || null,
                display_order: nextOrder,
                prefecture: {
                    connect: { id: prefectureId }
                }
            }
        });

        return res.status(201).json({
            success: true,
            data: newVenue,
            message: '会場が正常に登録されました'
        });
    } catch (error) {
        console.error('会場登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: '会場の登録に失敗しました',
            error: error.message
        });
    }
}