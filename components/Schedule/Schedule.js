// components/Schedule/Schedule.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Schedule({ schedules = [] }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [processedSchedules, setProcessedSchedules] = useState([]);
    const [schedulePeriod, setSchedulePeriod] = useState('');

    // スケジュールデータ処理
    useEffect(() => {
        // APIから受け取ったデータをチェック
        console.log("APIから受け取ったスケジュールデータ:", schedules);

        // データがオブジェクト形式の場合（APIから期間情報付きで返ってきた場合）
        if (schedules && schedules.period && schedules.schedules) {
            // 期間情報を設定
            setSchedulePeriod(schedules.period.formatted);
            // スケジュールリストを設定
            setProcessedSchedules(schedules.schedules);
        }
        // データが配列の場合（旧形式または変換前）
        else if (Array.isArray(schedules)) {
            setProcessedSchedules(schedules);
            // 期間情報がない場合は設定しない
            setSchedulePeriod('');
        }
        // データが無効な場合
        else {
            console.error("スケジュールデータが正しい形式ではありません:", schedules);
            setProcessedSchedules([]);
            setSchedulePeriod('');
        }
    }, [schedules]);

    // フィルタリング関数
    const filterSchedules = (schedules) => {
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

    // APIデータからスケジュールを取得
    const apiSchedules = processedSchedules;

    // フィルタリングされたスケジュール
    const filteredSchedules = filterSchedules(apiSchedules);

    return (
        <section className="schedule-section" id="schedule">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">SCHEDULE</h2>
                    <p className="section-subtitle">スケジュール</p>
                    <a href="#" className="view-all">VIEW ALL</a>
                </div>
                <div className="schedule-container">
                    <div className="schedule-header">
                        <h3 className="schedule-period">{schedulePeriod}</h3>
                    </div>

                    <div className="schedule-tabs">
                        <button
                            className={`schedule-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            すべて
                        </button>
                        <button
                            className={`schedule-tab ${activeFilter === 'event' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('event')}
                        >
                            イベント
                        </button>
                        <button
                            className={`schedule-tab ${activeFilter === 'stage' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('stage')}
                        >
                            舞台・朗読
                        </button>
                        <button
                            className={`schedule-tab ${activeFilter === 'broadcast' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('broadcast')}
                        >
                            生放送
                        </button>
                    </div>

                    <ul className="schedule-items">
                        {filteredSchedules.length > 0 ? (
                            filteredSchedules.map(schedule => {
                                const date = formatDate(schedule.date);
                                // ロケーションが会場か放送局かによって表示アイコンやスタイルを変更できる
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
                                            <a href={schedule.link} className="schedule-link">詳細はこちら →</a>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <div className="no-schedule">該当する予定はありません。</div>
                        )}
                    </ul>
                </div>
            </div>
        </section>
    );
}