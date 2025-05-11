// components/OnAir/OnAir.js
export default function OnAir({ content = [] }) {
    // APIから取得したデータがない場合のフォールバックデータ
    const fallbackContent = content.length ? content : {
        anime: [
            {
                id: '1',
                title: 'アイドリッシュセブン Third BEAT!',
                role: '十龍之介 役',
                broadcasts: [
                    { channel: 'TOKYO MX', time: '毎週日曜 22:30～' },
                    { channel: 'BS11', time: '毎週月曜 24:00～' },
                    { channel: '配信', time: '各話放送後 dアニメストア・Amazonプライム' }
                ]
            },
            {
                id: '2',
                title: 'クラシック★スターズ',
                role: 'ロスト・ヴィヴァルディ 役',
                broadcasts: [
                    { channel: 'BS11', time: '毎週木曜 23:00～' },
                    { channel: 'TOKYO MX', time: '毎週金曜 22:30～' }
                ]
            },
            {
                id: '3',
                title: '完璧すぎて可愛げがないと婚約破棄された聖女は隣国に売られる',
                role: 'オスヴァルト・パルナコルタ 役',
                broadcasts: [
                    { channel: 'AT-X', time: '毎週月曜 23:30～' },
                    { channel: '配信', time: '毎週月曜 25:00～ ABEMA・各配信サイト' }
                ]
            }
        ],
        radio: [
            {
                id: '4',
                title: '佐藤拓也のちょっとやってみて!!',
                broadcasts: [
                    { channel: 'ニコニコ生放送', time: '隔週木曜 21:00～' },
                    { channel: 'YouTube', time: '生放送後アーカイブ配信' }
                ]
            },
            {
                id: '5',
                title: '佐藤拓也&堀江瞬 アニメみたいに!',
                broadcasts: [
                    { channel: 'YouTube Live', time: '月1回土曜 20:00～' }
                ]
            },
            {
                id: '6',
                title: '羽多野渉・佐藤拓也のScat Babys Show!!',
                broadcasts: [
                    { channel: '文化放送', time: '毎週金曜 25:30～' },
                    { channel: '音泉', time: '翌週月曜配信' }
                ]
            }
        ],
        web: [
            {
                id: '7',
                title: '声優ステーションTV',
                broadcasts: [
                    { channel: 'AbemaTV', time: '月1回更新' }
                ]
            },
            {
                id: '8',
                title: '中澤まさとも・佐藤拓也の胸キュンラボ from 100シーンの恋＋',
                broadcasts: [
                    { channel: 'YouTube', time: '月2回更新' },
                    { channel: 'ニコニコ動画', time: 'YouTube配信の1週間後' }
                ]
            }
        ]
    };

    return (
        <section className="on-air-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">NOW ON AIR</h2>
                    <p className="section-subtitle">放送中のコンテンツ</p>
                </div>
                <div className="on-air-container">
                    <div className="on-air-category">
                        <h3 className="category-title">アニメ</h3>
                        <ul className="on-air-list">
                            {fallbackContent.anime.map(item => (
                                <li className="on-air-item" key={item.id}>
                                    <span className="on-air-title">{item.title}</span>
                                    <span className="on-air-role">{item.role}</span>
                                    <div className="broadcast-info">
                                        {item.broadcasts.map((broadcast, index) => (
                                            <div className="broadcast-item" key={index}>
                                                <span className="broadcast-channel">{broadcast.channel}</span>
                                                <span className="broadcast-time">{broadcast.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="on-air-category">
                        <h3 className="category-title">ラジオ・配信番組</h3>
                        <ul className="on-air-list">
                            {fallbackContent.radio.map(item => (
                                <li className="on-air-item" key={item.id}>
                                    <span className="on-air-title">{item.title}</span>
                                    <div className="broadcast-info">
                                        {item.broadcasts.map((broadcast, index) => (
                                            <div className="broadcast-item" key={index}>
                                                <span className="broadcast-channel">{broadcast.channel}</span>
                                                <span className="broadcast-time">{broadcast.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="on-air-category">
                        <h3 className="category-title">WEB番組</h3>
                        <ul className="on-air-list">
                            {fallbackContent.web.map(item => (
                                <li className="on-air-item" key={item.id}>
                                    <span className="on-air-title">{item.title}</span>
                                    <div className="broadcast-info">
                                        {item.broadcasts.map((broadcast, index) => (
                                            <div className="broadcast-item" key={index}>
                                                <span className="broadcast-channel">{broadcast.channel}</span>
                                                <span className="broadcast-time">{broadcast.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}