// pages/api/schedules/[id].js
import { supabase } from '../../../lib/supabase';
import { getWeekday } from '../../../lib/form-helpers';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'IDパラメータが必要です' });
    }

    // GET: スケジュール詳細取得
    if (req.method === 'GET') {
        try {
            console.log(`スケジュール詳細取得: ID=${id}`);

            // スケジュール詳細データを取得
            const { data: schedule, error } = await supabase
                .from('schedules')
                .select(`
                    id,
                    title,
                    start_datetime,
                    end_datetime,
                    is_all_day,
                    description,
                    official_url,
                    category:category_id (id, name, color_code),
                    venue:venue_id (
                        id, 
                        name, 
                        address,
                        prefecture_id (id, name)
                    ),
                    broadcastStation:broadcast_station_id (id, name),
                    performers:rel_schedule_performers (
                        id,
                        role_description,
                        display_order,
                        performer:performer_id (id, name, is_takuya_sato)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('スケジュール詳細取得エラー:', error);
                throw error;
            }

            if (!schedule) {
                return res.status(404).json({ error: 'スケジュールが見つかりません' });
            }

            console.log(`スケジュール詳細取得成功: タイトル=${schedule.title}`);

            // 日本時間での時刻計算
            const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換
            const startDate = new Date(schedule.start_datetime);
            const endDate = schedule.end_datetime ? new Date(schedule.end_datetime) : null;

            // 長期開催の判定（開始日と終了日が異なる日）
            const isLongTerm = endDate && 
                startDate.toISOString().split('T')[0] !== endDate.toISOString().split('T')[0];

            // 会期状況の判定
            let periodStatus = null;
            if (isLongTerm) {
                const now = new Date();
                const startDateOnly = new Date(startDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
                const endDateOnly = new Date(endDate.toISOString().split('T')[0] + 'T23:59:59.999Z');
                
                if (now < startDateOnly) {
                    periodStatus = 'upcoming'; // 開催前
                } else if (now > endDateOnly) {
                    periodStatus = 'ended'; // 終了
                } else {
                    periodStatus = 'ongoing'; // 開催中
                }
            }

            // 日本時間での日付・時刻整形
            const jstDate = new Date(startDate.getTime() + jstOffset);
            
            // 曜日計算（JST変換後の日付を使用して正しい曜日を取得）
            const weekday = getWeekday(jstDate);
            const jstString = jstDate.toISOString();
            const [datePart, timePart] = jstString.split('T');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes] = timePart.split(':');
            
            const formattedDate = `${year}-${month}-${day}`;
            const timeInfo = `${hours}:${minutes}`;
            
            // 終了日の整形（長期開催の場合）
            let endDateFormatted = null;
            let endTimeInfo = null;
            let endWeekday = null;
            if (isLongTerm && endDate) {
                // 日本時間での日付・時刻整形
                const jstEndDate = new Date(endDate.getTime() + jstOffset);
                
                // 終了日の曜日を正しく計算（JST変換後の日付を使用）
                endWeekday = getWeekday(jstEndDate);
                const jstEndString = jstEndDate.toISOString();
                const [endDatePart, endTimePart] = jstEndString.split('T');
                const [endYear, endMonth, endDay] = endDatePart.split('-');
                const [endHours, endMinutes] = endTimePart.split(':');
                
                endDateFormatted = `${endYear}-${endMonth}-${endDay}`;
                endTimeInfo = `${endHours}:${endMinutes}`;
            }

            // カテゴリに応じてロケーション情報を選択
            const isBroadcast = schedule.category?.name === '生放送';
            const location = isBroadcast
                ? (schedule.broadcastStation ? schedule.broadcastStation.name : '')
                : (schedule.venue ? schedule.venue.name : '');
            const prefecture = !isBroadcast && schedule.venue?.prefecture_id?.name || null;

            // 出演者情報を整形（佐藤拓也さんを最初に）
            const performers = schedule.performers
                .filter(p => p.performer)
                .sort((a, b) => {
                    // 佐藤拓也さんを最初に
                    if (a.performer.is_takuya_sato && !b.performer.is_takuya_sato) return -1;
                    if (!a.performer.is_takuya_sato && b.performer.is_takuya_sato) return 1;
                    // 表示順での並び替え
                    return (a.display_order || 0) - (b.display_order || 0);
                })
                .map(p => ({
                    name: p.performer.name,
                    role: p.role_description,
                    isTakuyaSato: p.performer.is_takuya_sato
                }));

            // カテゴリコード変換
            const categoryCode = schedule.category?.name === 'イベント' ? 'event' :
                schedule.category?.name === '舞台・朗読' ? 'stage' :
                    schedule.category?.name === '生放送' ? 'broadcast' :
                        schedule.category?.name === '音声ガイド' ? 'voice_guide' : 'other';

            // レスポンス形式
            const response = {
                id: schedule.id,
                title: schedule.title,
                date: formattedDate,
                datetime: schedule.start_datetime,
                endDatetime: schedule.end_datetime,
                endDate: endDateFormatted,
                endTime: endTimeInfo,
                endWeekday: endWeekday,
                isLongTerm: isLongTerm,
                periodStatus: periodStatus,
                weekday: weekday,
                category: categoryCode,
                categoryName: schedule.category?.name || '',
                categoryColor: schedule.category?.color_code || null,
                time: timeInfo,
                isAllDay: schedule.is_all_day || false,
                location: location,
                locationType: isBroadcast ? '放送/配信' : '会場',
                prefecture: prefecture,
                address: !isBroadcast && schedule.venue?.address || null,
                accessInfo: null, // access_infoカラムが存在しないため、nullを返す
                description: schedule.description || '',
                performers: performers,
                officialUrl: schedule.official_url || null
            };

            return res.status(200).json(response);
        } catch (error) {
            console.error('スケジュール詳細取得エラー:', error);
            return res.status(500).json({
                error: 'スケジュール詳細の取得に失敗しました',
                message: error.message
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