// components/ScheduleCalendar/ScheduleCalendar.js
import { useState } from 'react';
import Link from 'next/link';
import { FaCalendarDay, FaExternalLinkAlt } from 'react-icons/fa';

export default function ScheduleCalendar({ schedules, year, month, activeFilter }) {
    // フィルタリングされたスケジュール
    const filteredSchedules = activeFilter === 'all' 
        ? schedules 
        : schedules.filter(schedule => schedule.category === activeFilter);

    // カレンダーの日付を生成（月曜始まり）
    const generateCalendarDays = () => {
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = 日曜日
        
        // 月曜始まりに調整（日曜日=0 → 6, 月曜日=1 → 0）
        const mondayStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

        const days = [];
        
        // 前月の最終日を取得
        const prevMonth = new Date(year, month - 2, 0);
        const prevMonthLastDay = prevMonth.getDate();
        
        // 前月の日付で埋める（月曜始まり）
        for (let i = mondayStartDay - 1; i >= 0; i--) {
            days.push({ 
                day: prevMonthLastDay - i, 
                isCurrentMonth: false,
                isPrevMonth: true
            });
        }
        
        // 今月の日付
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({ day, isCurrentMonth: true });
        }
        
        // 次月の日付で42個（6週分）まで埋める
        const remainingCells = 42 - days.length;
        for (let day = 1; day <= remainingCells; day++) {
            days.push({ 
                day, 
                isCurrentMonth: false,
                isNextMonth: true
            });
        }
        
        return days;
    };

    // 指定日のスケジュールを取得
    const getSchedulesForDay = (day) => {
        if (!day) return [];
        
        // 日本時間での日付文字列を作成
        const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        return filteredSchedules.filter(schedule => {
            // スケジュールの日付文字列（YYYY-MM-DD形式）
            const scheduleDateStr = schedule.date.split('T')[0];
            
            // 長期開催の場合は期間内かチェック
            if (schedule.isLongTerm && schedule.endDate) {
                const endDateStr = schedule.endDate.split('T')[0];
                return scheduleDateStr <= targetDateStr && targetDateStr <= endDateStr;
            }
            
            // 通常のスケジュールは日付が一致
            return scheduleDateStr === targetDateStr;
        });
    };

    // 長期開催イベントの期間情報を取得
    const getLongTermEventInfo = (schedule, day) => {
        if (!schedule.isLongTerm || !schedule.endDate) return { position: 'single' };
        
        const startDateStr = schedule.date.split('T')[0];
        const endDateStr = schedule.endDate.split('T')[0];
        const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const isStart = startDateStr === targetDateStr;
        const isEnd = endDateStr === targetDateStr;
        
        if (isStart && isEnd) return { position: 'single' };
        if (isStart) return { position: 'start' };
        if (isEnd) return { position: 'end' };
        return { position: 'middle' };
    };

    // 今日の日付（日本時間）
    const getJapanToday = () => {
        const now = new Date();
        const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        return {
            year: japanTime.getUTCFullYear(),
            month: japanTime.getUTCMonth() + 1,
            date: japanTime.getUTCDate()
        };
    };
    
    const japanToday = getJapanToday();
    const isToday = (day) => {
        if (!day) return false;
        return (
            year === japanToday.year &&
            month === japanToday.month &&
            day === japanToday.date
        );
    };

    // カテゴリの色を取得（スケジュールデータのcategoryColorを使用）
    const getCategoryColor = (schedule) => {
        return schedule.categoryColor || 'var(--primary-color)';
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="schedule-calendar">
            <div className="calendar-grid">
                <div className="weekday-headers">
                    <div className="weekday">月</div>
                    <div className="weekday">火</div>
                    <div className="weekday">水</div>
                    <div className="weekday">木</div>
                    <div className="weekday">金</div>
                    <div className="weekday">土</div>
                    <div className="weekday">日</div>
                </div>
                
                <div className="calendar-days">
                    {calendarDays.map((dayObj, index) => {
                    const { day, isCurrentMonth, isPrevMonth, isNextMonth } = dayObj;
                    const daySchedules = isCurrentMonth ? getSchedulesForDay(day) : [];
                    const hasSchedules = daySchedules.length > 0;
                    const isTodayCell = isCurrentMonth && isToday(day);
                    
                    return (
                        <div
                            key={index}
                            className={`calendar-day ${!isCurrentMonth ? 'empty' : ''} ${isTodayCell ? 'today' : ''} ${hasSchedules ? 'has-schedule' : ''}`}
                        >
                            {isCurrentMonth && (
                                <>
                                    <div className="day-number">{day}</div>
                                    {hasSchedules && (
                                <div className="day-schedules">
                                    {daySchedules.map((schedule, idx) => (
                                        <Link 
                                            key={schedule.id} 
                                            href={`/schedules/${schedule.id}`}
                                            className="schedule-item-link"
                                        >
                                            <div 
                                                className="schedule-item-mini"
                                                style={{ backgroundColor: getCategoryColor(schedule) }}
                                                title={`${schedule.title} (${schedule.categoryName})`}
                                            >
                                                {!schedule.isAllDay && schedule.time && (
                                                    <span className="schedule-time">
                                                        {schedule.time}
                                                    </span>
                                                )}
                                                <span className="schedule-title-mini">
                                                    {schedule.title}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                    </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
                </div>
            </div>

            {/* カレンダー下部の詳細リスト */}
            {filteredSchedules.length > 0 && (
                <div className="calendar-schedule-list">
                    <h3 className="calendar-list-title">
                        <FaCalendarDay className="calendar-list-icon" />
                        {month}月のスケジュール詳細
                    </h3>
                    <div className="calendar-schedule-items">
                        {filteredSchedules.map(schedule => (
                            <Link 
                                key={schedule.id} 
                                href={`/schedules/${schedule.id}`}
                                className="calendar-schedule-item"
                            >
                                <div className="calendar-item-date">
                                    <span className="calendar-item-day">
                                        {new Date(schedule.date).getDate()}日
                                    </span>
                                    <span className="calendar-item-weekday">
                                        {['日', '月', '火', '水', '木', '金', '土'][new Date(schedule.date).getDay()]}
                                    </span>
                                </div>
                                <div className="calendar-item-content">
                                    <div className="calendar-item-header">
                                        <h4 className="calendar-item-title">{schedule.title}</h4>
                                        <span 
                                            className="calendar-item-category"
                                            style={{ backgroundColor: getCategoryColor(schedule) }}
                                        >
                                            {schedule.categoryName}
                                        </span>
                                    </div>
                                    <div className="calendar-item-details">
                                        {schedule.time && (
                                            <span className="calendar-item-time">
                                                🕒 {schedule.time}
                                            </span>
                                        )}
                                        {schedule.location && (
                                            <span className="calendar-item-location">
                                                📍 {schedule.location}
                                            </span>
                                        )}
                                        {schedule.isLongTerm && schedule.endDate && (
                                            <span className="calendar-item-period">
                                                📅 {new Date(schedule.date).getDate()}日〜{new Date(schedule.endDate).getDate()}日
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <FaExternalLinkAlt className="calendar-item-link-icon" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}