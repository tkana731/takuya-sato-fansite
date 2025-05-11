// pages/api/schedules/create.js
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
        // スケジュールデータを作成
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
        } else {
            scheduleData.venue_id = locationId;
        }

        // トランザクションでスケジュールとパフォーマンス情報を一括登録
        const result = await prisma.$transaction(async (tx) => {
            // スケジュールを登録
            const schedule = await tx.schedule.create({
                data: scheduleData
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
                        // SQL文を直接実行して time 型としてデータを挿入
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

        return res.status(201).json({
            success: true,
            data: result,
            message: 'スケジュールが正常に登録されました'
        });
    } catch (error) {
        console.error('スケジュール登録エラー:', error);
        return res.status(500).json({
            success: false,
            message: 'スケジュールの登録に失敗しました',
            error: error.message
        });
    }
}