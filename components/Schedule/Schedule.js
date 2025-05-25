// components/Schedule/Schedule.js
import { useState, useEffect, forwardRef, useRef } from 'react';
import Link from 'next/link';
import CalendarButton from '../CalendarButton/CalendarButton';

const Schedule = forwardRef((props, ref) => {
    const { schedules = [] } = props;
    const [activeFilter, setActiveFilter] = useState('all');
    const [processedSchedules, setProcessedSchedules] = useState([]);
    const [schedulePeriod, setSchedulePeriod] = useState('');
    const [loading, setLoading] = useState(true);
    const scheduleRef = useRef(null);

    // 日本時間で現在の年月を取得
    const getCurrentJSTMonth = () => {
        const now = new Date();
        const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換
        const jstNow = new Date(now.getTime() + jstOffset);
        return {
            year: jstNow.getFullYear(),
            month: jstNow.getMonth() + 1 // 0-11 -> 1-12
        };
    };

    // 初期データロード
    useEffect(() => {
        const loadSchedulesData = async () => {
            try {
                setLoading(true);
                // 現在の月のスケジュールを取得
                const { year, month } = getCurrentJSTMonth();

                // 月の初日と最終日を計算
                const firstDay = new Date(Date.UTC(year, month - 1, 1));
                const lastDay = new Date(Date.UTC(year, month, 0));

                // ISO形式に変換
                const fromDateStr = firstDay.toISOString().split('T')[0];
                const toDateStr = lastDay.toISOString().split('T')[0];

                console.log(`スケジュール取得: ${year}年${month}月 (${fromDateStr} 〜 ${toDateStr})`);

                // データが渡されていない場合はAPIから取得
                if (!schedules || !schedules.schedules || schedules.schedules.length === 0) {
                    const response = await fetch(`/api/schedules?from=${fromDateStr}&to=${toDateStr}`);
                    if (!response.ok) {
                        throw new Error('スケジュールデータの取得に失敗しました');
                    }
                    const data = await response.json();

                    setSchedulePeriod(`${year}.${String(month).padStart(2, '0')}`);
                    setProcessedSchedules(data.schedules || []);
                } else {
                    // すでにscheduleデータが渡されている場合はそれを使用
                    if (schedules.period) {
                        setSchedulePeriod(schedules.period.formatted);
                    } else {
                        setSchedulePeriod(`${year}.${String(month).padStart(2, '0')}`);
                    }

                    setProcessedSchedules(
                        Array.isArray(schedules.schedules)
                            ? schedules.schedules
                            : (Array.isArray(schedules) ? schedules : [])
                    );
                }
            } catch (error) {
                console.error('スケジュール取得エラー:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSchedulesData();
    }, [schedules]);

    // フィルタリング関数
    const filterSchedules = (schedules) => {
        if (!schedules || !Array.isArray(schedules)) return [];

        if (activeFilter === 'all') {
            return schedules;
        }
        return schedules.filter(schedule => schedule.category === activeFilter);
    };

    // 日付のフォーマット
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        };
    };

    // フィルタリングされたスケジュール
    const filteredSchedules = filterSchedules(processedSchedules);

    return (
        <section className="schedule-section" id="schedule" ref={ref || scheduleRef}>
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">SCHEDULE</h2>
                    <p className="section-subtitle">スケジュール</p>
                </div>
                <div className="schedule-container">
                    <div className="schedule-header">
                        <h3 className="schedule-period">{schedulePeriod}</h3>
                    </div>

                    <div className="schedule-tabs-wrapper">
                        <div className="schedule-tabs">
                            <button
                                className={`schedule-tab ${activeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('all')}
                            >
                                <span className="tab-text">すべて</span>
                            </button>
                            <button
                                className={`schedule-tab ${activeFilter === 'event' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('event')}
                            >
                                <span className="tab-text">イベント</span>
                            </button>
                            <button
                                className={`schedule-tab ${activeFilter === 'stage' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('stage')}
                            >
                                <span className="tab-text">舞台・朗読</span>
                            </button>
                            <button
                                className={`schedule-tab ${activeFilter === 'broadcast' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('broadcast')}
                            >
                                <span className="tab-text">生放送</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="audio-wave">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <p className="loading-text">LOADING...</p>
                        </div>
                    ) : (
                        <ul className="schedule-items">
                            {filteredSchedules.length > 0 ? (
                                filteredSchedules.map(schedule => {
                                    const date = formatDate(schedule.date);
                                    // ロケーションが会場か放送局かによって表示アイコンやスタイルを変更できる
                                    const isBroadcast = schedule.locationType === '放送/配信';
                                    // 公式リンクが有効かどうかをチェック
                                    const hasValidLink = schedule.link && schedule.link !== '#';

                                    return (
                                        <li className="schedule-item" key={schedule.id} data-category={schedule.category}>
                                            <div className="schedule-date">
                                                <span className="date-year">{date.year}</span>
                                                <span className="date-month">{date.month}</span>
                                                <span className="date-day">{date.day}</span>
                                                <span className="date-weekday">{schedule.weekday}</span>
                                            </div>
                                            <div className="schedule-content">
                                                <span className={`schedule-category category-${schedule.category}`}>{schedule.categoryName}</span>
                                                <h3 className="schedule-title">{schedule.title}</h3>
                                                <p className="schedule-info">
                                                    <span className="schedule-time">{schedule.time}</span> / {schedule.location}
                                                    {isBroadcast && <small className="ml-1 text-gray-600">（{schedule.locationType}）</small>}
                                                </p>
                                                <p className="schedule-info">{schedule.description}</p>
                                                {hasValidLink && (
                                                    <a href={schedule.link} className="schedule-link" target="_blank" rel="noopener noreferrer">詳細はこちら →</a>
                                                )}
                                                <CalendarButton schedule={schedule} />
                                            </div>
                                        </li>
                                    );
                                })
                            ) : (
                                <div className="no-schedule">該当する予定はありません。</div>
                            )}
                        </ul>
                    )}

                    <div className="view-all-container">
                        <Link href="/schedule" className="view-all">VIEW ALL</Link>
                    </div>
                </div>
            </div>
        </section>
    );
});

Schedule.displayName = 'Schedule';

export default Schedule;