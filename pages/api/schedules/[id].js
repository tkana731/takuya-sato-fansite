// pages/api/schedules/[id].js
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
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'スケジュールIDが指定されていません'
        });
    }

    // GET: スケジュール取得
    if (req.method === 'GET') {
        try {
            console.log(`スケジュール取得: ID=${id}`);

            // スケジュールデータを取得
            const { data: schedule, error } = await supabase
                .from('schedules')
                .select(`
                    id,
                    title,
                    category_id,
                    venue_id,
                    broadcast_station_id,
                    start_date,
                    end_date,
                    is_all_day,
                    description,
                    official_url,
                    category:category_id (id, name),
                    venue:venue_id (id, name),
                    broadcastStation:broadcast_station_id (id, name),
                    performances:rel_schedule_performances (
                        id,
                        performance_date,
                        start_time,
                        display_start_time,
                        display_end_time,
                        display_order
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('スケジュール取得エラー:', error);
                throw error;
            }

            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    message: '指定されたスケジュールが見つかりません'
                });
            }

            console.log(`スケジュール取得成功: タイトル=${schedule.title}`);

            // パフォーマンス情報を整形
            const performanceInfo = schedule.performances
                .sort((a, b) => a.display_order - b.display_order)
                .map(p => p.display_start_time)
                .join(' / ');

            // フロントエンド用に整形したデータ
            const formattedSchedule = {
                id: schedule.id,
                title: schedule.title,
                categoryId: schedule.category_id,
                category: schedule.category,
                venueId: schedule.venue_id,
                venue: schedule.venue,
                broadcastStationId: schedule.broadcast_station_id,
                broadcastStation: schedule.broadcastStation,
                startDate: schedule.start_date,
                endDate: schedule.end_date,
                isAllDay: schedule.is_all_day,
                description: schedule.description,
                officialUrl: schedule.official_url,
                performanceInfo
            };

            return res.status(200).json({
                success: true,
                data: formattedSchedule
            });
        } catch (error) {
            console.error('スケジュール取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'スケジュールの取得に失敗しました',
                error: error.message,
                details: error.details || error.stack
            });
        }
    }
    // PUT: スケジュール更新
    else if (req.method === 'PUT') {
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
            console.log(`スケジュール更新: ID=${id}, タイトル=${title}`);

            // スケジュールデータを更新
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

            // スケジュールを更新
            const { data: updatedSchedule, error: scheduleError } = await supabase
                .from('schedules')
                .update(scheduleData)
                .eq('id', id)
                .select()
                .single();

            if (scheduleError) {
                console.error('スケジュール更新エラー:', scheduleError);
                throw scheduleError;
            }

            console.log(`スケジュールを更新しました: ID=${id}`);

            // 既存のパフォーマンス情報を削除
            const { error: deleteError } = await supabase
                .from('rel_schedule_performances')
                .delete()
                .eq('schedule_id', id);

            if (deleteError) {
                console.error('パフォーマンス削除エラー:', deleteError);
                throw deleteError;
            }

            console.log('既存のパフォーマンス情報を削除しました');

            // パフォーマンス情報がある場合は登録
            if (performanceInfo) {
                const timeStrings = performanceInfo.split('/').map(str => str.trim());
                const startDateObj = new Date(startDate);

                console.log(`新しいパフォーマンス情報を登録: ${timeStrings.length}件`);

                // 各パフォーマンスを個別に登録
                for (let index = 0; index < timeStrings.length; index++) {
                    const timeString = timeStrings[index];
                    // 時間文字列から時分を抽出
                    const parsedTime = parseTimeString(timeString);

                    // 登録データを作成
                    const performanceData = {
                        schedule_id: id,
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

            return res.status(200).json({
                success: true,
                data: updatedSchedule,
                message: 'スケジュールが正常に更新されました'
            });
        } catch (error) {
            console.error('スケジュール更新エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'スケジュールの更新に失敗しました',
                error: error.message,
                details: error.details || error.stack
            });
        }
    }
    // DELETE: スケジュール削除
    else if (req.method === 'DELETE') {
        try {
            console.log(`スケジュール削除: ID=${id}`);

            // 関連するパフォーマンス情報を削除
            const { error: performancesError } = await supabase
                .from('rel_schedule_performances')
                .delete()
                .eq('schedule_id', id);

            if (performancesError) {
                console.error('パフォーマンス削除エラー:', performancesError);
                throw performancesError;
            }

            console.log('関連するパフォーマンス情報を削除しました');

            // スケジュールを削除
            const { error: scheduleError } = await supabase
                .from('schedules')
                .delete()
                .eq('id', id);

            if (scheduleError) {
                console.error('スケジュール削除エラー:', scheduleError);
                throw scheduleError;
            }

            console.log(`スケジュールを削除しました: ID=${id}`);

            return res.status(200).json({
                success: true,
                message: 'スケジュールが正常に削除されました'
            });
        } catch (error) {
            console.error('スケジュール削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'スケジュールの削除に失敗しました',
                error: error.message,
                details: error.details || error.stack
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}