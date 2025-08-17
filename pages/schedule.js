// pages/schedule.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';
import CalendarButton from '../components/CalendarButton/CalendarButton';
import { FaCalendarAlt, FaExternalLinkAlt, FaMapMarkerAlt, FaClock, FaInfo, FaUser, FaTv, FaYoutube } from 'react-icons/fa';
import ScheduleCard from '../components/ScheduleCard/ScheduleCard';
import ScheduleCalendar from '../components/ScheduleCalendar/ScheduleCalendar';
import Link from 'next/link';

export default function SchedulePage({ initialSchedules, initialYearRange }) {
    const router = useRouter();
    const [schedules, setSchedules] = useState(initialSchedules || []);
    const [loading, setLoading] = useState(false);
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

    // URLパラメータの変更を監視と初期値の設定
    useEffect(() => {
        const { year, month } = router.query;
        
        // URLパラメータがある場合は設定
        if (year && month) {
            const parsedYear = parseInt(year);
            const parsedMonth = parseInt(month);
            
            // 有効な年月の場合のみ設定
            if (parsedYear > 0 && parsedMonth >= 1 && parsedMonth <= 12) {
                setDisplayDate({
                    year: parsedYear,
                    month: parsedMonth
                });
            }
        } else if (router.isReady) {
            // URLパラメータがない場合は現在の年月をURLに設定
            router.replace({
                pathname: '/schedule',
                query: { year: currentYear, month: currentMonth + 1 }
            }, undefined, { shallow: true });
        }
    }, [router.query, router.isReady, currentYear, currentMonth, router]);

    // 年月選択モーダルの表示状態
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempYear, setTempYear] = useState(displayDate.year);
    const [tempMonth, setTempMonth] = useState(displayDate.month);

    // 選択可能な年の範囲（SSGで取得済み）
    const [yearRange, setYearRange] = useState(initialYearRange || {
        minYear: currentYear - 1,
        maxYear: currentYear + 1
    });

    // 月の移動
    const handlePrevMonth = () => {
        setDisplayDate(prev => {
            let newYear = prev.year;
            let newMonth = prev.month - 1;
            
            // 1月の場合は前年の12月に
            if (newMonth === 0) {
                newYear = prev.year - 1;
                newMonth = 12;
            }
            
            // URLパラメータを更新
            router.push({
                pathname: '/schedule',
                query: { year: newYear, month: newMonth }
            }, undefined, { shallow: true });
            
            return { year: newYear, month: newMonth };
        });
    };

    const handleNextMonth = () => {
        setDisplayDate(prev => {
            let newYear = prev.year;
            let newMonth = prev.month + 1;
            
            // 12月の場合は翌年の1月に
            if (newMonth === 13) {
                newYear = prev.year + 1;
                newMonth = 1;
            }
            
            // URLパラメータを更新
            router.push({
                pathname: '/schedule',
                query: { year: newYear, month: newMonth }
            }, undefined, { shallow: true });
            
            return { year: newYear, month: newMonth };
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
        // URLパラメータを更新
        router.push({
            pathname: '/schedule',
            query: { year: tempYear, month: tempMonth }
        }, undefined, { shallow: true });
        
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

    // 日付範囲はSSGで事前取得済み

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

                const response = await fetch(`/api/schedules?from=${fromDateStr}&to=${toDateStr}`);
                if (!response.ok) {
                    throw new Error('スケジュールデータの取得に失敗しました');
                }
                const data = await response.json();

                // 月表示用のフォーマット設定
                const monthDisplay = `${displayDate.year}年${displayDate.month}月`;

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

        // 初期表示時はSSGデータを使用、月切り替え時のみフェッチ
        if (displayDate.year !== currentYear || displayDate.month !== currentMonth + 1) {
            fetchSchedulesByMonth();
        } else {
            // 現在の月に戻った場合、初期データが既にある場合はそれを使用
            if (initialSchedules && initialSchedules.schedules) {
                setSchedules(initialSchedules);
                setLoading(false);
            } else {
                // 初期データがない場合は再フェッチ
                fetchSchedulesByMonth();
            }
        }
    }, [displayDate, currentYear, currentMonth, initialSchedules]);

    // カテゴリフィルタリングの状態
    const [activeFilter, setActiveFilter] = useState('all');
    
    // 表示モードの状態（list: 一覧表示, calendar: カレンダー表示）
    const [viewMode, setViewMode] = useState('list');

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
    const monthDisplay = `${displayDate.year}年${displayDate.month}月`;

    // フィルタリングされたスケジュール
    const filteredSchedules = schedules && schedules.schedules
        ? filterSchedules(schedules.schedules)
        : [];
    
    // 長期開催と通常のスケジュールを分離
    const longTermSchedules = filteredSchedules.filter(schedule => schedule.isLongTerm);
    const regularSchedules = filteredSchedules.filter(schedule => !schedule.isLongTerm);
    

    // スケジュールページのメタデータ
    const pageTitle = `佐藤拓也さんスケジュール ${monthDisplay} | 佐藤拓也さん非公式ファンサイト`;
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
                        image: event.image || 'https://takuya-sato-fansite.com/takuya-sato-default.jpg',
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

                    {/* 表示モード切り替えタブ */}
                    <div className="works-tabs">
                        <div className="works-tabs-container">
                            <button
                                className={`works-tab ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                role="tab"
                                aria-selected={viewMode === 'list'}
                                aria-controls="list-view"
                                id="list-tab"
                            >
                                スケジュール一覧
                            </button>
                            <button
                                className={`works-tab ${viewMode === 'calendar' ? 'active' : ''}`}
                                onClick={() => setViewMode('calendar')}
                                role="tab"
                                aria-selected={viewMode === 'calendar'}
                                aria-controls="calendar-view"
                                id="calendar-tab"
                            >
                                カレンダー
                            </button>
                        </div>
                    </div>

                    {/* カテゴリ選択 */}
                    <div className="category-select-container">
                        <label htmlFor="schedule-page-category-select" className="category-select-label">
                            カテゴリー:
                        </label>
                        <select
                            id="schedule-page-category-select"
                            className="category-select"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                            aria-label="スケジュールカテゴリーを選択"
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
                    ) : error ? (
                        <div className="error-message">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} className="retry-button">再読み込み</button>
                        </div>
                    ) : (
                        <div role="tabpanel" id={`${viewMode}-view`} aria-labelledby={`${viewMode}-tab`}>
                            {viewMode === 'list' ? (
                                <div role="tabpanel" id={`${activeFilter}-content`} aria-labelledby={`${activeFilter}-tab`}>
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
                                </div>
                            ) : (
                                <ScheduleCalendar 
                                    schedules={schedules.schedules || []}
                                    year={displayDate.year}
                                    month={displayDate.month}
                                    activeFilter={activeFilter}
                                />
                            )}
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

// SSG (Static Site Generation) の実装
export async function getStaticProps() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // 現在月のスケジュールデータを取得（日本時間）
        const now = new Date();
        const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const currentYear = japanTime.getUTCFullYear();
        const currentMonth = japanTime.getUTCMonth(); // 0-11

        // 現在月の初日と最終日を取得
        const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
        const lastDay = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

        const fromDateStr = firstDay.toISOString().split('T')[0];
        const toDateStr = lastDay.toISOString().split('T')[0];

        // 並列でデータを取得
        const [schedulesRes, yearRangeRes] = await Promise.allSettled([
            fetch(`${baseUrl}/api/schedules?from=${fromDateStr}&to=${toDateStr}`),
            fetch(`${baseUrl}/api/schedules/date-range`)
        ]);

        const initialSchedules = schedulesRes.status === 'fulfilled' && schedulesRes.value.ok
            ? await schedulesRes.value.json() : [];
        const initialYearRange = yearRangeRes.status === 'fulfilled' && yearRangeRes.value.ok
            ? await yearRangeRes.value.json() : {
                minYear: currentYear - 1,
                maxYear: currentYear + 1
            };

        return {
            props: {
                initialSchedules,
                initialYearRange
            },
            revalidate: 1800 // 30分ごとに再生成（スケジュールは更新頻度が高いため）
        };
    } catch (error) {
        console.error('Static props generation error:', error);

        // エラー時のフォールバック（日本時間）
        const now = new Date();
        const japanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const currentYear = japanTime.getUTCFullYear();
        return {
            props: {
                initialSchedules: [],
                initialYearRange: {
                    minYear: currentYear - 1,
                    maxYear: currentYear + 1
                }
            },
            revalidate: 300 // エラー時は5分後に再試行
        };
    }
}