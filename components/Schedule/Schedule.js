// components/Schedule/Schedule.js
import { useState, useEffect, forwardRef, useRef } from 'react';
import Link from 'next/link';
import CalendarButton from '../CalendarButton/CalendarButton';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaInfo, FaUser } from 'react-icons/fa';

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
                            <button
                                className={`schedule-tab ${activeFilter === 'voice_guide' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('voice_guide')}
                            >
                                <span className="tab-text">音声ガイド</span>
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
                        <>
                            {/* 長期開催スケジュール */}
                            {longTermSchedules.length > 0 && (
                                <div className="long-term-schedules">
                                    <ul className="schedule-items long-term">
                                        {longTermSchedules.map(schedule => {
                                            const startDate = formatDate(schedule.date);
                                            const endDate = formatDate(schedule.endDate);
                                            const isBroadcast = schedule.locationType === '放送/配信';
                                            const hasValidLink = schedule.link && schedule.link !== '#';

                                            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                                            const startDateObj = new Date(schedule.date);
                                            const endDateObj = new Date(schedule.endDate);
                                            const startWeekday = weekdays[startDateObj.getDay()];
                                            const endWeekday = weekdays[endDateObj.getDay()];

                                            return (
                                                <li className="schedule-card long-term-card" key={schedule.id} data-category={schedule.category}>
                                                    <div className="schedule-date-badge long-term-badge">
                                                        <div className="schedule-year">{startDate.year}</div>
                                                        <div className="schedule-date-range">
                                                            <div className="date-start">
                                                                <span className="date-value">
                                                                    {String(startDate.month).padStart(2, '0')}/{String(startDate.day).padStart(2, '0')}
                                                                </span>
                                                                <div className="schedule-weekday">{startWeekday}</div>
                                                            </div>
                                                            <div className="date-separator">〜</div>
                                                            <div className="date-end">
                                                                <span className="date-value">
                                                                    {String(endDate.month).padStart(2, '0')}/{String(endDate.day).padStart(2, '0')}
                                                                </span>
                                                                <div className="schedule-weekday">{endWeekday}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="schedule-content">
                                                        <Link href={`/schedules/${schedule.id}`} className="schedule-title-link">
                                                            <h3 className="schedule-title">{schedule.title}</h3>
                                                        </Link>
                                                        {schedule.categoryName && (
                                                            <div className="header-badges" style={{ marginTop: '12px', marginBottom: '8px', justifyContent: 'flex-start' }}>
                                                                <span 
                                                                    className="category-badge"
                                                                    style={{ backgroundColor: schedule.categoryColor || 'var(--primary-color)' }}
                                                                >
                                                                    {schedule.categoryName}
                                                                </span>
                                                                {schedule.isLongTerm && (
                                                                    <span className={`period-badge ${schedule.periodStatus}`}>
                                                                        {schedule.periodStatus === 'ongoing' ? '開催中' :
                                                                         schedule.periodStatus === 'upcoming' ? '開催予定' :
                                                                         '終了'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="schedule-details">
                                                            <div className="schedule-detail-item">
                                                                <span className="detail-icon">{isBroadcast ? '📺' : <FaMapMarkerAlt />}</span>
                                                                <span>
                                                                    {schedule.location}
                                                                    {!isBroadcast && schedule.prefecture && (
                                                                        <span className="prefecture">（{schedule.prefecture}）</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {isBroadcast && (
                                                                <div className="schedule-detail-item">
                                                                    <span className="detail-icon">📡</span>
                                                                    <span>{schedule.locationType}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {schedule.performers && schedule.performers.length > 0 && (
                                                            <div className="schedule-description-wrapper">
                                                                <div className="schedule-detail-item">
                                                                    <span className="detail-icon"><FaUser /></span>
                                                                    <div className="performers-list">
                                                                        {schedule.performers.map((performer, index) => (
                                                                            <span key={index} className={`performer ${performer.isTakuyaSato ? 'takuya-sato' : ''}`}>
                                                                                {performer.name}
                                                                                {performer.role && ` (${performer.role})`}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {!schedule.performers?.length && schedule.description && (
                                                            <div className="schedule-description-wrapper">
                                                                <div className="schedule-detail-item">
                                                                    <span className="detail-icon"><FaInfo /></span>
                                                                    <p className="schedule-description">{schedule.description}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="schedule-actions">
                                                            {hasValidLink && (
                                                                <a
                                                                    href={schedule.link}
                                                                    className="schedule-link-button"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title="関連リンク（外部サイト）"
                                                                    aria-label="関連リンク（外部サイト）"
                                                                >
                                                                    <FaExternalLinkAlt />
                                                                    <span className="button-text">関連リンク</span>
                                                                </a>
                                                            )}
                                                            <CalendarButton schedule={schedule} />
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* 通常のスケジュール */}
                            <ul className="schedule-items">
                                {regularSchedules.length > 0 ? (
                                    regularSchedules.map(schedule => {
                                    const date = formatDate(schedule.date);
                                    // ロケーションが会場か放送局かによって表示アイコンやスタイルを変更できる
                                    const isBroadcast = schedule.locationType === '放送/配信';
                                    // 公式リンクが有効かどうかをチェック
                                    const hasValidLink = schedule.link && schedule.link !== '#';

                                    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                                    const dateObj = new Date(schedule.date);
                                    const weekday = weekdays[dateObj.getDay()];

                                    return (
                                        <li className="schedule-card" key={schedule.id} data-category={schedule.category}>
                                            <div className="schedule-date-badge">
                                                <div className="schedule-year">{date.year}</div>
                                                <div className="schedule-month-day">
                                                    {String(date.month).padStart(2, '0')}/{String(date.day).padStart(2, '0')}
                                                </div>
                                                <div className="schedule-weekday">{weekday}</div>
                                            </div>
                                            <div className="schedule-content">
                                                <Link href={`/schedules/${schedule.id}`} className="schedule-title-link">
                                                    <h3 className="schedule-title">{schedule.title}</h3>
                                                </Link>
                                                {schedule.categoryName && (
                                                    <div className="header-badges" style={{ marginTop: '12px', marginBottom: '8px', justifyContent: 'flex-start' }}>
                                                        <span 
                                                            className="category-badge"
                                                            style={{ backgroundColor: schedule.categoryColor || 'var(--primary-color)' }}
                                                        >
                                                            {schedule.categoryName}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="schedule-details">
                                                    {!schedule.isAllDay && (
                                                        <div className="schedule-detail-item">
                                                            <span className="detail-icon"><FaClock /></span>
                                                            <span>{schedule.time}</span>
                                                        </div>
                                                    )}
                                                    <div className="schedule-detail-item">
                                                        <span className="detail-icon">{isBroadcast ? '📺' : <FaMapMarkerAlt />}</span>
                                                        <span>
                                                            {schedule.location}
                                                            {!isBroadcast && schedule.prefecture && (
                                                                <span className="prefecture">（{schedule.prefecture}）</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    {isBroadcast && (
                                                        <div className="schedule-detail-item">
                                                            <span className="detail-icon">📡</span>
                                                            <span>{schedule.locationType}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {schedule.performers && schedule.performers.length > 0 && (
                                                    <div className="schedule-description-wrapper">
                                                        <div className="schedule-detail-item">
                                                            <span className="detail-icon"><FaUser /></span>
                                                            <div className="performers-list">
                                                                出演: {schedule.performers.map((performer, index) => (
                                                                    <span key={index} className={`performer ${performer.isTakuyaSato ? 'takuya-sato' : ''}`}>
                                                                        {performer.name}
                                                                        {performer.role && ` (${performer.role})`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {!schedule.performers?.length && schedule.description && (
                                                    <div className="schedule-description-wrapper">
                                                        <div className="schedule-detail-item">
                                                            <span className="detail-icon"><FaInfo /></span>
                                                            <p className="schedule-description">{schedule.description}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="schedule-actions">
                                                    {hasValidLink && (
                                                        <a
                                                            href={schedule.link}
                                                            className="schedule-link-button"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="関連リンク（外部サイト）"
                                                            aria-label="関連リンク（外部サイト）"
                                                        >
                                                            <FaExternalLinkAlt />
                                                            <span className="button-text">関連リンク</span>
                                                        </a>
                                                    )}
                                                    <CalendarButton schedule={schedule} />
                                                </div>
                                            </div>
                                        </li>
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