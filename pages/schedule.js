// pages/schedule.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';
import CalendarButton from '../components/CalendarButton/CalendarButton';
import { FaCalendarAlt, FaExternalLinkAlt } from 'react-icons/fa';

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

    // 年月選択モーダルの表示状態
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempYear, setTempYear] = useState(displayDate.year);
    const [tempMonth, setTempMonth] = useState(displayDate.month);
    
    // 選択可能な年の範囲
    const [yearRange, setYearRange] = useState({
        minYear: currentYear - 1,
        maxYear: currentYear + 1
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

    // 年月選択モーダルを開く
    const openDatePicker = () => {
        setTempYear(displayDate.year);
        setTempMonth(displayDate.month);
        setShowDatePicker(true);
    };

    // 年月選択を確定
    const confirmDateSelection = () => {
        setDisplayDate({ year: tempYear, month: tempMonth });
        setShowDatePicker(false);
    };

    // 年月選択をキャンセル
    const cancelDateSelection = () => {
        setShowDatePicker(false);
        setTempYear(displayDate.year);
        setTempMonth(displayDate.month);
    };

    // 年の選択肢を生成（データベースの最小年から最大年まで）
    const yearOptions = [];
    for (let i = yearRange.minYear; i <= yearRange.maxYear; i++) {
        yearOptions.push(i);
    }

    // 日付範囲を取得
    useEffect(() => {
        async function fetchDateRange() {
            try {
                const response = await fetch('/api/schedules/date-range');
                if (response.ok) {
                    const data = await response.json();
                    setYearRange(data);
                }
            } catch (error) {
                console.error('日付範囲の取得エラー:', error);
            }
        }
        
        fetchDateRange();
    }, []);

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

    // スケジュールページのメタデータ
    const pageTitle = `佐藤拓也さんスケジュール ${monthDisplay} | 非公式ファンサイト`;
    const pageDescription = `声優・佐藤拓也さんの${monthDisplay}のイベント、舞台、生放送などの出演スケジュールをまとめています。最新の活動予定をチェックできます。`;

    // イベントの構造化データを作成
    const createEventSchemaData = () => {
        if (!filteredSchedules.length) return null;

        return {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `佐藤拓也さん ${monthDisplay} スケジュール一覧`,
            description: pageDescription,
            numberOfItems: filteredSchedules.length,
            itemListElement: filteredSchedules.map((event, index) => {
                // 日付をISO形式に変換
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toISOString();

                return {
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@type': 'Event',
                        name: event.title,
                        description: event.description || `佐藤拓也さん出演 ${event.categoryName}`,
                        startDate: formattedDate,
                        endDate: formattedDate,
                        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
                        eventStatus: 'https://schema.org/EventScheduled',
                        location: {
                            '@type': 'Place',
                            name: event.location || '未定',
                        },
                        performer: {
                            '@type': 'Person',
                            name: '佐藤拓也'
                        },
                        organizer: {
                            '@type': 'Organization',
                            name: event.organizer || '主催者'
                        },
                        offers: {
                            '@type': 'Offer',
                            availability: 'https://schema.org/InStock',
                            price: event.price || '0',
                            priceCurrency: 'JPY',
                            url: event.link && event.link !== '#' ? event.link : null
                        },
                        image: event.image || 'https://takuya-sato-fansite.vercel.app/takuya-sato-default.jpg',
                        url: event.link && event.link !== '#' ? event.link : null
                    }
                };
            })
        };
    };

    return (
        <Layout>
            <SEO
                title={pageTitle}
                description={pageDescription}
                type="article"
            />
            {filteredSchedules.length > 0 && (
                <SchemaOrg
                    type="Event"
                    data={createEventSchemaData()}
                />
            )}

            <section className="schedule-page-section">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">SCHEDULE</h1>
                        <p className="section-subtitle">スケジュール一覧</p>
                    </div>

                    {/* 月切り替えナビゲーション */}
                    <div className="month-navigation" aria-label="月切り替えナビゲーション">
                        <button
                            onClick={handlePrevMonth}
                            className="month-nav-button prev-month"
                            aria-label={`${displayDate.month === 1 ? displayDate.year - 1 : displayDate.year}年${displayDate.month === 1 ? 12 : displayDate.month - 1}月へ移動`}
                        >
                            &lt; 前月
                        </button>
                        <button
                            onClick={openDatePicker}
                            className="current-month-button"
                            aria-label="年月を選択"
                        >
                            <h2 className="current-month">{monthDisplay}</h2>
                            <FaCalendarAlt className="calendar-icon" size={16} />
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="month-nav-button next-month"
                            aria-label={`${displayDate.month === 12 ? displayDate.year + 1 : displayDate.year}年${displayDate.month === 12 ? 1 : displayDate.month + 1}月へ移動`}
                        >
                            翌月 &gt;
                        </button>
                    </div>

                    {/* カテゴリタブ */}
                    <div className="schedule-tabs-wrapper">
                        <div className="schedule-tabs" role="tablist" aria-label="スケジュールカテゴリー">
                            <button
                                className={`schedule-tab ${activeFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('all')}
                                role="tab"
                                aria-selected={activeFilter === 'all'}
                                aria-controls="all-content"
                                id="all-tab"
                            >
                                <span className="tab-text">すべて</span>
                            </button>
                            <button
                                className={`schedule-tab ${activeFilter === 'event' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('event')}
                                role="tab"
                                aria-selected={activeFilter === 'event'}
                                aria-controls="event-content"
                                id="event-tab"
                            >
                                <span className="tab-text">イベント</span>
                            </button>
                            <button
                                className={`schedule-tab ${activeFilter === 'stage' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('stage')}
                                role="tab"
                                aria-selected={activeFilter === 'stage'}
                                aria-controls="stage-content"
                                id="stage-tab"
                            >
                                <span className="tab-text">舞台・朗読</span>
                            </button>
                            <button
                                className={`schedule-tab ${activeFilter === 'broadcast' ? 'active' : ''}`}
                                onClick={() => setActiveFilter('broadcast')}
                                role="tab"
                                aria-selected={activeFilter === 'broadcast'}
                                aria-controls="broadcast-content"
                                id="broadcast-tab"
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
                        <div role="tabpanel" id={`${activeFilter}-content`} aria-labelledby={`${activeFilter}-tab`}>
                            <ul className="schedule-items">
                                {filteredSchedules.length > 0 ? (
                                    filteredSchedules.map(schedule => {
                                        const date = formatDate(schedule.date);
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
                                                    <h3 className="schedule-title">{schedule.title}</h3>
                                                    <div className="schedule-details">
                                                        {!schedule.isAllDay && (
                                                            <div className="schedule-detail-item">
                                                                <span className="detail-icon">🕒</span>
                                                                <span>{schedule.time}</span>
                                                            </div>
                                                        )}
                                                        <div className="schedule-detail-item">
                                                            <span className="detail-icon">{isBroadcast ? '📺' : '📍'}</span>
                                                            <span>{schedule.location}</span>
                                                        </div>
                                                        {isBroadcast ? (
                                                            <div className="schedule-detail-item">
                                                                <span className="detail-icon">📡</span>
                                                                <span>{schedule.locationType}</span>
                                                            </div>
                                                        ) : schedule.prefecture && (
                                                            <div className="schedule-detail-item">
                                                                <span className="detail-icon">🗾</span>
                                                                <span>{schedule.prefecture}</span>
                                                            </div>
                                                        )}
                                                        {schedule.categoryName && (
                                                            <div className="schedule-detail-item">
                                                                <span className="detail-icon">🏷️</span>
                                                                <span className="schedule-category-badge">{schedule.categoryName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {schedule.description && (
                                                        <div className="schedule-description-wrapper">
                                                            <p className="schedule-description">{schedule.description}</p>
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
                                    <div className="no-schedule">該当する予定はありません。</div>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* 年月選択モーダル */}
                    {showDatePicker && (
                        <div className="date-picker-overlay" onClick={cancelDateSelection}>
                            <div className="date-picker-modal" onClick={(e) => e.stopPropagation()}>
                                <h3 className="date-picker-title">年月を選択</h3>
                                <div className="date-picker-content">
                                    <div className="date-picker-row">
                                        <label htmlFor="year-select" className="date-picker-label">年</label>
                                        <select
                                            id="year-select"
                                            value={tempYear}
                                            onChange={(e) => setTempYear(Number(e.target.value))}
                                            className="date-picker-select"
                                        >
                                            {yearOptions.map(year => (
                                                <option key={year} value={year}>{year}年</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="date-picker-row">
                                        <label htmlFor="month-select" className="date-picker-label">月</label>
                                        <select
                                            id="month-select"
                                            value={tempMonth}
                                            onChange={(e) => setTempMonth(Number(e.target.value))}
                                            className="date-picker-select"
                                        >
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}月</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="date-picker-actions">
                                    <button
                                        onClick={cancelDateSelection}
                                        className="date-picker-button date-picker-cancel"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={confirmDateSelection}
                                        className="date-picker-button date-picker-confirm"
                                    >
                                        決定
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}