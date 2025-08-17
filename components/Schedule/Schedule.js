// components/Schedule/Schedule.js
import { useState, useEffect, forwardRef, useRef } from 'react';
import Link from 'next/link';
import CalendarButton from '../CalendarButton/CalendarButton';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaInfo, FaUser, FaTv, FaYoutube } from 'react-icons/fa';
import ScheduleCard from '../ScheduleCard/ScheduleCard';

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

                // データが渡されていない場合はAPIから取得
                if (!schedules || !schedules.schedules || schedules.schedules.length === 0) {
                    const response = await fetch(`/api/schedules?from=${fromDateStr}&to=${toDateStr}`);
                    if (!response.ok) {
                        throw new Error('スケジュールデータの取得に失敗しました');
                    }
                    const data = await response.json();

                    setSchedulePeriod(`${year}.${month}`);
                    setProcessedSchedules(data.schedules || []);
                } else {
                    // すでにscheduleデータが渡されている場合はそれを使用
                    if (schedules.period) {
                        setSchedulePeriod(schedules.period.formatted);
                    } else {
                        setSchedulePeriod(`${year}.${month}`);
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
    
    // 長期開催と通常のスケジュールを分離
    const longTermSchedules = filteredSchedules.filter(schedule => schedule.isLongTerm);
    const regularSchedules = filteredSchedules.filter(schedule => !schedule.isLongTerm);
    

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

                    <div className="category-select-container">
                        <label htmlFor="schedule-category-select" className="category-select-label">
                            カテゴリー:
                        </label>
                        <select
                            id="schedule-category-select"
                            className="category-select"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                        >
                            <option value="all">すべて</option>
                            <option value="event">イベント</option>
                            <option value="stage">舞台・朗読</option>
                            <option value="broadcast">生放送</option>
                            <option value="streaming">配信</option>
                            <option value="voice_guide">音声ガイド</option>
                            <option value="other">その他</option>
                        </select>
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
                        <>
                            {/* 長期開催スケジュール */}
                            {longTermSchedules.length > 0 && (
                                <div className="long-term-schedules">
                                    <ul className="schedule-items long-term">
                                        {longTermSchedules.map(schedule => {
                                            return (
                                                <ScheduleCard 
                                                    key={schedule.id}
                                                    schedule={schedule}
                                                    showLink={true}
                                                    showCalendarButton={true}
                                                    linkPath={`/schedules/${schedule.id}`}
                                                />
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* 通常のスケジュール */}
                            <ul className="schedule-items">
                                {regularSchedules.length > 0 ? (
                                    regularSchedules.map(schedule => {
                                    return (
                                        <ScheduleCard 
                                            key={schedule.id}
                                            schedule={schedule}
                                            showLink={true}
                                            showCalendarButton={true}
                                            linkPath={`/schedules/${schedule.id}`}
                                        />
                                    );
                                })
                                ) : (
                                    longTermSchedules.length === 0 && (
                                        <div className="no-schedule">該当する予定はありません。</div>
                                    )
                                )}
                            </ul>
                        </>
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