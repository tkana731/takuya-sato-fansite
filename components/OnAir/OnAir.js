// components/OnAir/OnAir.js
export default function OnAir({ content = [] }) {
    // APIデータをチェック
    const hasContent = content &&
        (content.anime?.length > 0 ||
            content.radio?.length > 0 ||
            content.web?.length > 0);

    // データがない場合
    if (!hasContent) {
        return null; // 表示しない
    }

    return (
        <section className="on-air-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">NOW ON AIR</h2>
                    <p className="section-subtitle">放送中のコンテンツ</p>
                </div>
                <div className="on-air-container">
                    {content.anime && content.anime.length > 0 && (
                        <div className="on-air-category">
                            <h3 className="category-title">アニメ</h3>
                            <ul className="on-air-list">
                                {content.anime.map(item => (
                                    <li className="on-air-item" key={item.id}>
                                        <span className="on-air-title">{item.title}</span>
                                        {item.role && <span className="on-air-role">{item.role}</span>}
                                        <div className="broadcast-info">
                                            {item.broadcasts && item.broadcasts.map((broadcast, index) => (
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
                    )}

                    {content.radio && content.radio.length > 0 && (
                        <div className="on-air-category">
                            <h3 className="category-title">ラジオ・配信番組</h3>
                            <ul className="on-air-list">
                                {content.radio.map(item => (
                                    <li className="on-air-item" key={item.id}>
                                        <span className="on-air-title">{item.title}</span>
                                        <div className="broadcast-info">
                                            {item.broadcasts && item.broadcasts.map((broadcast, index) => (
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
                    )}

                    {content.web && content.web.length > 0 && (
                        <div className="on-air-category">
                            <h3 className="category-title">WEB番組</h3>
                            <ul className="on-air-list">
                                {content.web.map(item => (
                                    <li className="on-air-item" key={item.id}>
                                        <span className="on-air-title">{item.title}</span>
                                        <div className="broadcast-info">
                                            {item.broadcasts && item.broadcasts.map((broadcast, index) => (
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
                    )}
                </div>
            </div>
        </section>
    );
}