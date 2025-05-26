// pages/api/schedules/[id].js
import { supabase } from '../../../lib/supabase';

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
                    start_datetime,
                    end_datetime,
                    is_all_day,
                    description,
                    official_url,
                    category:category_id (id, name),
                    venue:venue_id (id, name),
                    broadcastStation:broadcast_station_id (id, name)
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

            // 時刻情報をstart_datetimeから取得
            // start_datetimeはtimestamptzなので、既に正しいタイムゾーン情報を持っている
            const startDate = new Date(schedule.start_datetime);
            const hours = startDate.getHours();
            const minutes = startDate.getMinutes();
            const performanceInfo = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

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
                startDate: schedule.start_datetime,
                endDate: schedule.end_datetime,
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
                start_datetime: new Date(startDate).toISOString(),
                end_datetime: endDate ? new Date(endDate).toISOString() : null,
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