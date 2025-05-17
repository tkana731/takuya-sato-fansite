// pages/schedule.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';

export default function SchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 日本時間の現在日時を取得する関数
    const getJSTDate = () => {
        const utcDate = new Date();
        const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換
        return new Date(utcDate.getTime() + jstOffset);
    };

    // 月選択のための状態
    const currentDate = getJSTDate();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11

    // 表示する月（初期値は現在の月）
    const [displayDate, setDisplayDate] = useState({
        year: currentYear,
        month: currentMonth + 1 // 表示用は1-12
    });

    // 月の移動
    const handlePrevMonth = () => {
        setDisplayDate(prev => {
            // 1月の場合は前年の12月に
            if (prev.month === 1) {
                return { year: prev.year - 1, month: 12 };
            }
            return { year: prev.year, month: prev.month - 1 };
        });
    };

    const handleNextMonth = () => {
        setDisplayDate(prev => {
            // 12月の場合は翌年の1月に
            if (prev.month === 12) {
                return { year: prev.year + 1, month: 1 };
            }
            return { year: prev.year, month: prev.month + 1 };
        });
    };

    // 選択された月に基づいてスケジュールを取得
    useEffect(() => {
        async function fetchSchedulesByMonth() {
            setLoading(true);
            try {
                // 選択された月の初日と最終日を取得
                const firstDay = new Date(Date.UTC(displayDate.year, displayDate.month - 1, 1)); // UTC時間で月初日

                // 月末日を計算（次の月の0日 = 今月の最終日）
                const lastDay = new Date(Date.UTC(displayDate.year, displayDate.month, 0));

                // ISO形式に変換
                const fromDateStr = firstDay.toISOString().split('T')[0]; // 月初日
                const toDateStr = lastDay.toISOString().split('T')[0];    // 月末日

                console.log(`スケジュール取得: ${displayDate.year}年${displayDate.month}月 (${fromDateStr} 〜 ${toDateStr})`);

                const response = await fetch(`/api/schedules?from=${fromDateStr}&to=${toDateStr}`);
                if (!response.ok) {
                    throw new Error('スケジュールデータの取得に失敗しました');
                }
                const data = await response.json();

                // 月表示用のフォーマット設定
                const monthDisplay = `${displayDate.year}年${String(displayDate.month).padStart(2, '0')}月`;

                // レスポンスデータを設定
                setSchedules({
                    ...data,
                    period: {
                        ...data.period,
                        formatted: monthDisplay
                    },
                    schedules: data.schedules || []
                });
            } catch (err) {
                console.error('スケジュールの取得エラー:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchSchedulesByMonth();
    }, [displayDate]);

    // カテゴリフィルタリングの状態
    const [activeFilter, setActiveFilter] = useState('all');

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

    // 月の表示テキスト
    const monthDisplay = `${displayDate.year}年${String(displayDate.month).padStart(2, '0')}月`;

    // フィルタリングされたスケジュール
    const filteredSchedules = schedules && schedules.schedules
        ? filterSchedules(schedules.schedules)
        : [];

    return (
        <Layout title="スケジュール一覧 - 佐藤拓也さん非公式ファンサイト">
            <section className="schedule-page-section">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">SCHEDULE</h1>
                        <p className="section-subtitle">スケジュール一覧</p>
                    </div>

                    {/* 月切り替えナビゲーション */}
                    <div className="month-navigation">
                        <button
                            onClick={handlePrevMonth}
                            className="month-nav-button prev-month"
                            aria-label="前月へ"
                        >
                            &lt; 前月
                        </button>
                        <h2 className="current-month">{monthDisplay}</h2>
                        <button
                            onClick={handleNextMonth}
                            className="month-nav-button next-month"
                            aria-label="翌月へ"
                        >
                            翌月 &gt;
                        </button>
                    </div>

                    {/* カテゴリタブ */}
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
                    ) : error ? (
                        <div className="error-message">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} className="retry-button">再読み込み</button>
                        </div>
                    ) : (
                        <ul className="schedule-items">
                            {filteredSchedules.length > 0 ? (
                                filteredSchedules.map(schedule => {
                                    const date = formatDate(schedule.date);
                                    const isBroadcast = schedule.locationType === '放送/配信';

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
                                                <a href={schedule.link} className="schedule-link" target="_blank" rel="noopener noreferrer">詳細はこちら →</a>
                                            </div>
                                        </li>
                                    );
                                })
                            ) : (
                                <div className="no-schedule">該当する予定はありません。</div>
                            )}
                        </ul>
                    )}
                </div>
            </section>
        </Layout>
    );
}