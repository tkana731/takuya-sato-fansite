// pages/api/venues/create.js
import { supabase } from '../../../lib/supabase';

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
        const { data: maxOrderVenue, error: orderError } = await supabase
            .from('mst_venues')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);

        if (orderError) throw orderError;

        // 次の表示順を決定
        const nextOrder = maxOrderVenue && maxOrderVenue.length > 0 ? maxOrderVenue[0].display_order + 1 : 1;

        // 会場を登録
        const { data: newVenue, error } = await supabase
            .from('mst_venues')
            .insert([{
                name,
                postal_code: postalCode || null,
                prefecture_id: prefectureId,
                address: address || null,
                capacity: capacity || null,
                official_url: officialUrl || null,
                google_maps_url: googleMapsUrl || null,
                display_order: nextOrder
            }])
            .select();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data: newVenue[0],
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