// pages/api/schedules/date-range.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 最も古いスケジュールの日付を取得
        const { data: minData, error: minError } = await supabase
            .from('schedules')
            .select('start_datetime')
            .order('start_datetime', { ascending: true })
            .limit(1);

        // 最も新しいスケジュールの日付を取得
        const { data: maxData, error: maxError } = await supabase
            .from('schedules')
            .select('start_datetime')
            .order('start_datetime', { ascending: false })
            .limit(1);

        if (minError || maxError) {
            console.error('データ取得エラー:', minError || maxError);
            throw new Error('データの取得に失敗しました');
        }

        if (!minData || !minData.length || !maxData || !maxData.length) {
            throw new Error('スケジュールデータが見つかりません');
        }

        const minDate = new Date(minData[0].start_datetime);
        const maxDate = new Date(maxData[0].start_datetime);

        return res.status(200).json({
            minYear: minDate.getFullYear(),
            maxYear: maxDate.getFullYear()
        });
    } catch (error) {
        console.error('日付範囲の取得エラー:', error);
        return res.status(500).json({ 
            error: '日付範囲の取得に失敗しました',
            message: error.message 
        });
    }
}