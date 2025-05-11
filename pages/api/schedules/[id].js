// pages/api/schedules/[id].js
import prisma from '../../../lib/prisma';

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
            // スケジュールデータを取得
            const schedule = await prisma.schedule.findUnique({
                where: {
                    id: id
                },
                include: {
                    category: true,
                    venue: true,
                    broadcastStation: true,
                    performances: {
                        orderBy: {
                            display_order: 'asc'
                        }
                    }
                }
            });

            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    message: '指定されたスケジュールが見つかりません'
                });
            }

            // パフォーマンス情報を整形
            const performanceInfo = schedule.performances
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
                startDate: schedule.start_date.toISOString(),
                endDate: schedule.end_date ? schedule.end_date.toISOString() : null,
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
                error: error.message
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
            // スケジュールデータを更新
            const scheduleData = {
                title,
                category_id: categoryId,
                start_date: new Date(startDate),
                end_date: endDate ? new Date(endDate) : null,
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

            // トランザクションでスケジュールとパフォーマンス情報を一括更新
            const result = await prisma.$transaction(async (tx) => {
                // スケジュールを更新
                const schedule = await tx.schedule.update({
                    where: {
                        id: id
                    },
                    data: scheduleData
                });

                // 既存のパフォーマンス情報を削除
                await tx.schedulePerformance.deleteMany({
                    where: {
                        schedule_id: id
                    }
                });

                // パフォーマンス情報がある場合は登録
                if (performanceInfo) {
                    const timeStrings = performanceInfo.split('/').map(str => str.trim());
                    const startDateObj = new Date(startDate);

                    // 各パフォーマンスを個別に登録
                    for (let index = 0; index < timeStrings.length; index++) {
                        const timeString = timeStrings[index];
                        // 時間文字列から時分を抽出
                        const parsedTime = parseTimeString(timeString);

                        // 登録データを作成
                        const performanceData = {
                            schedule_id: schedule.id,
                            performance_date: startDateObj,
                            display_start_time: timeString,
                            display_order: index + 1
                        };

                        // パースできた場合は start_time を設定
                        if (parsedTime) {
                            // 現在日付のUTC時間を作成し、そこに時間を設定
                            // この方法ならタイムゾーンの問題を回避できる
                            await tx.$executeRaw`
                                INSERT INTO "rel_schedule_performances" 
                                (id, schedule_id, performance_date, start_time, display_start_time, display_order, created_at)
                                VALUES 
                                (
                                    gen_random_uuid(), 
                                    ${schedule.id}, 
                                    ${startDateObj}::date, 
                                    ${`${parsedTime.hours}:${parsedTime.minutes}`}::time, 
                                    ${timeString}, 
                                    ${index + 1}, 
                                    now()
                                )
                            `;
                        } else {
                            // 時間が抽出できなかった場合は start_time なしで登録
                            await tx.schedulePerformance.create({
                                data: performanceData
                            });
                        }
                    }
                }

                return schedule;
            });

            return res.status(200).json({
                success: true,
                data: result,
                message: 'スケジュールが正常に更新されました'
            });
        } catch (error) {
            console.error('スケジュール更新エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'スケジュールの更新に失敗しました',
                error: error.message
            });
        }
    }
    // DELETE: スケジュール削除
    else if (req.method === 'DELETE') {
        try {
            // トランザクションでスケジュールとパフォーマンス情報を一括削除
            await prisma.$transaction(async (prisma) => {
                // 関連するパフォーマンス情報を削除
                await prisma.schedulePerformance.deleteMany({
                    where: {
                        schedule_id: id
                    }
                });

                // スケジュールを削除
                await prisma.schedule.delete({
                    where: {
                        id: id
                    }
                });
            });

            return res.status(200).json({
                success: true,
                message: 'スケジュールが正常に削除されました'
            });
        } catch (error) {
            console.error('スケジュール削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'スケジュールの削除に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}