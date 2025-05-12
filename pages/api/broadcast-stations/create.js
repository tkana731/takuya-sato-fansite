// pages/api/broadcast-stations/create.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, typeId, officialUrl } = req.body;

    // バリデーション
    if (!name || !typeId) {
        return res.status(400).json({ message: '必須項目が入力されていません' });
    }

    try {
        // 最大の表示順を取得
        const { data: maxOrderStation, error: orderError } = await supabase
            .from('mst_broadcast_stations')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);

        if (orderError) throw orderError;

        // 次の表示順を決定
        const nextOrder = maxOrderStation && maxOrderStation.length > 0 ? maxOrderStation[0].display_order + 1 : 1;

        // 放送局を登録
        const { data: newStation, error } = await supabase
            .from('mst_broadcast_stations')
            .insert([{
                name,
                type_id: typeId,
                official_url: officialUrl || null,
                display_order: nextOrder
            }])
            .select();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            data: newStation[0],
            message: '放送局/配信サイトが正常に登録されました'
        });
    } catch (error) {
        console.error('放送局登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: '放送局/配信サイトの登録に失敗しました',
            error: error.message
        });
    }
}