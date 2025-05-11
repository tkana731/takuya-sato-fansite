// components/Schedule/Schedule.js
import { useState } from 'react';
import Link from 'next/link';

export default function Schedule({ schedules = [] }) {
    const [activeFilter, setActiveFilter] = useState('all');

    // APIから取得したデータがない場合のフォールバックデータ
    const fallbackSchedules = schedules.length ? schedules : [
        {
            id: '1',
            date: '2025-05-10',
            weekday: '土',
            category: 'event',
            categoryName: 'イベント',
            title: 'アイドリッシュセブン ファンミーティング',
            time: '14:00～',
            location: '東京・渋谷ストリームホール',
            description: '十龍之介役として出演',
            link: '#'
        },
        {
            id: '2',
            date: '2025-05-15',
            weekday: '木',
            category: 'broadcast',
            categoryName: '生放送',
            title: '佐藤拓也のちょっとやってみて!! 第157回',
            time: '21:00～',
            location: 'ニコニコ生放送・YouTube',
            description: 'ゲスト：羽多野渉',
            link: '#'
        },
        {
            id: '3',
            date: '2025-05-18',
            weekday: '日',
            category: 'stage',
            categoryName: '舞台・朗読',
            title: '朗読劇「月の向こう側」',
            time: '13:00～ / 17:00～',
            location: '東京芸術劇場',
            description: '主演：健人 役',
            link: '#'
        },
        {
            id: '4',
            date: '2025-05-21',
            weekday: '水',
            category: 'broadcast',
            categoryName: '生放送',
            title: 'アニメ「クラシック★スターズ」特番',
            time: '20:00～',
            location: 'ABEMA',
            description: '出演：佐藤拓也、小野賢章、花澤香菜',
            link: '#'
        },
        {
            id: '5',
            date: '2025-05-25',
            weekday: '日',
            category: 'event',
            categoryName: 'イベント',
            title: 'テイルズ オブ フェスティバル 2025',
            time: '12:30～',
            location: '横浜アリーナ',
            description: 'アルフェン役として出演',
            link: '#'
        },
        {
            id: '6',
            date: '2025-05-29',
            weekday: '木',
            category: 'stage',
            categoryName: '舞台・朗読',
            title: 'ヴォイスプレイ「Rシリーズ Vol.5」',
            time: '19:00～',
            location: '新宿文化センター',
            description: '出演：佐藤拓也、石川界人、内田雄馬',
            link: '#'
        },
        {
            id: '7',
            date: '2025-05-31',
            weekday: '土',
            category: 'broadcast',
            categoryName: '生放送',
            title: '佐藤拓也&堀江瞬 アニメみたいに! 第52回',
            time: '20:00～',
            location: 'YouTube Live',
            description: 'ゲスト：未定',
            link: '#'
        },
        {
            id: '8',
            date: '2025-06-03',
            weekday: '火',
            category: 'broadcast',
            categoryName: '生放送',
            title: '佐藤拓也のちょっとやってみて!! 第158回',
            time: '21:00～',
            location: 'ニコニコ生放送・YouTube',
            description: 'ゲスト：石川界人',
            link: '#'
        },
        {
            id: '9',
            date: '2025-06-08',
            weekday: '日',
            category: 'event',
            categoryName: 'イベント',
            title: '声優アワード2025 授賞式',
            time: '16:00～',
            location: '文化放送メディアプラスホール',
            description: 'プレゼンターとして出演',
            link: '#'
        }
    ];

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

    // フィルタリングされたスケジュール
    const filteredSchedules = filterSchedules(fallbackSchedules);

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
                        <h3 className="schedule-period">2025.05.10 - 2025.06.10</h3>
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