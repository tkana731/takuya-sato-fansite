// pages/api/schedules/create.js
import prisma from '../../../lib/prisma';

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
        const result = await prisma.$transaction(async (prisma) => {
            // スケジュールを登録
            const schedule = await prisma.schedule.create({
                data: scheduleData
            });

            // パフォーマンス情報がある場合は登録
            if (performanceInfo) {
                const timeStrings = performanceInfo.split('/').map(str => str.trim());

                const performances = timeStrings.map((timeString, index) => ({
                    schedule_id: schedule.id,
                    performance_date: new Date(startDate), // ここを修正: performanceDate → performance_date
                    display_start_time: timeString,
                    display_order: index + 1
                }));

                if (performances.length > 0) {
                    await prisma.schedulePerformance.createMany({
                        data: performances
                    });
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