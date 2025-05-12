// pages/api/schedules/create.js
import { supabase } from '../../../lib/supabase';

// 時間文字列（例: "14:00～"）からHoursとMinutesを抽出
function parseTimeString(timeString) {
    // 時間部分を抽出（数字とコロンを含む部分を取得）
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;

    // 時分を返す
    return {
        hours: parseInt(timeMatch[1], 10),
        minutes: parseInt(timeMatch[2], 10)
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const {
        title,
        categoryId,
        locationId,
        isLocationBroadcast,
        startDate,
        endDate,
        isAllDay,
        description,
        officialUrl,
        performanceInfo
    } = req.body;

    // バリデーション
    if (!title || !categoryId || !locationId || !startDate) {
        return res.status(400).json({
            success: false,
            message: '必須項目が入力されていません'
        });
    }

    try {
        console.log('スケジュール作成リクエスト:', {
            title,
            categoryId,
            isLocationBroadcast: isLocationBroadcast ? 'true' : 'false',
            startDate
        });

        // スケジュールデータを作成
        const scheduleData = {
            title,
            category_id: categoryId,
            start_date: new Date(startDate).toISOString(),
            end_date: endDate ? new Date(endDate).toISOString() : null,
            is_all_day: isAllDay || false,
            description: description || null,
            official_url: officialUrl || null
        };

        // カテゴリに応じてロケーションフィールドを設定
        if (isLocationBroadcast) {
            scheduleData.broadcast_station_id = locationId;
            scheduleData.venue_id = null;
        } else {
            scheduleData.venue_id = locationId;
            scheduleData.broadcast_station_id = null;
        }

        // トランザクションの代わりにSupabaseでスケジュールを作成
        const { data: newSchedule, error: scheduleError } = await supabase
            .from('schedules')
            .insert([scheduleData])
            .select()
            .single();

        if (scheduleError) {
            console.error('スケジュール作成エラー:', scheduleError);
            throw scheduleError;
        }

        console.log(`スケジュールを作成しました: ID=${newSchedule.id}`);

        // パフォーマンス情報がある場合は登録
        if (performanceInfo && newSchedule) {
            const timeStrings = performanceInfo.split('/').map(str => str.trim());
            const startDateObj = new Date(startDate);

            console.log(`パフォーマンス情報を処理: ${timeStrings.length}件`);

            // 各パフォーマンスを個別に登録
            for (let index = 0; index < timeStrings.length; index++) {
                const timeString = timeStrings[index];
                // 時間文字列から時分を抽出
                const parsedTime = parseTimeString(timeString);

                // 登録データを作成
                const performanceData = {
                    schedule_id: newSchedule.id,
                    performance_date: startDateObj.toISOString().split('T')[0],
                    display_start_time: timeString,
                    display_order: index + 1
                };

                // パースできた場合は start_time を設定
                if (parsedTime) {
                    const timeStr = `${parsedTime.hours.toString().padStart(2, '0')}:${parsedTime.minutes.toString().padStart(2, '0')}:00`;
                    performanceData.start_time = timeStr;
                }

                const { data: newPerformance, error: performanceError } = await supabase
                    .from('rel_schedule_performances')
                    .insert([performanceData])
                    .select();

                if (performanceError) {
                    console.error(`パフォーマンス登録エラー (${index + 1}/${timeStrings.length}):`, performanceError);
                    // エラーがあっても続行する
                } else {
                    console.log(`パフォーマンスを登録しました (${index + 1}/${timeStrings.length}): ID=${newPerformance?.[0]?.id}`);
                }
            }
        }

        return res.status(201).json({
            success: true,
            data: newSchedule,
            message: 'スケジュールが正常に登録されました'
        });
    } catch (error) {
        console.error('スケジュール登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: 'スケジュールの登録に失敗しました',
            error: error.message,
            details: error.details || error.stack
        });
    }
}