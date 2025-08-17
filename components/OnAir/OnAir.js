// components/OnAir/OnAir.js
import Link from 'next/link';
import { FaYoutube, FaTv, FaPlay } from 'react-icons/fa';
import { SiNiconico, SiTwitch } from 'react-icons/si';

export default function OnAir({ content = [] }) {
    // 放送局名に応じたアイコンを取得する関数
    const getBroadcastIcon = (channelName) => {
        const name = channelName.toLowerCase();
        if (name.includes('youtube')) {
            return <FaYoutube className="broadcast-icon youtube" />;
        } else if (name.includes('ニコニコ') || name.includes('niconico')) {
            return <SiNiconico className="broadcast-icon niconico" />;
        } else if (name.includes('twitch')) {
            return <SiTwitch className="broadcast-icon twitch" />;
        } else if (name.includes('配信') || name.includes('streaming')) {
            return <FaPlay className="broadcast-icon streaming" />;
        } else {
            return <FaTv className="broadcast-icon tv" />;
        }
    };
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
                            <h3 className="category-title">TVアニメ</h3>
                            <ul className="on-air-list">
                                {content.anime.map(item => (
                                    <li className="on-air-item" key={item.id}>
                                        <Link href={`/works/${item.id}`} className="on-air-title-link">
                                            {item.title}
                                        </Link>
                                        {item.role && <span className="on-air-role">{item.role}</span>}
                                        <div className="broadcast-info">
                                            {item.broadcasts && item.broadcasts.length > 0 ? (
                                                item.broadcasts.map((broadcast, index) => (
                                                    <div className="broadcast-item" key={index}>
                                                        {broadcast.officialUrl ? (
                                                            <a 
                                                                href={broadcast.officialUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="broadcast-channel-link"
                                                            >
                                                                {getBroadcastIcon(broadcast.channel)}
                                                                {broadcast.channel}
                                                            </a>
                                                        ) : (
                                                            <span className="broadcast-channel">
                                                                {getBroadcastIcon(broadcast.channel)}
                                                                {broadcast.channel}
                                                            </span>
                                                        )}
                                                        <span className="broadcast-time">{broadcast.time}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="broadcast-item">
                                                    <span className="broadcast-channel">放送情報</span>
                                                    <span className="broadcast-time">情報なし</span>
                                                </div>
                                            )}
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
                                        <Link href={`/works/${item.id}`} className="on-air-title-link">
                                            {item.title}
                                        </Link>
                                        {item.role && <span className="on-air-role">{item.role}</span>}
                                        <div className="broadcast-info">
                                            {item.broadcasts && item.broadcasts.length > 0 ? (
                                                item.broadcasts.map((broadcast, index) => (
                                                    <div className="broadcast-item" key={index}>
                                                        {broadcast.officialUrl ? (
                                                            <a 
                                                                href={broadcast.officialUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="broadcast-channel-link"
                                                            >
                                                                {getBroadcastIcon(broadcast.channel)}
                                                                {broadcast.channel}
                                                            </a>
                                                        ) : (
                                                            <span className="broadcast-channel">
                                                                {getBroadcastIcon(broadcast.channel)}
                                                                {broadcast.channel}
                                                            </span>
                                                        )}
                                                        <span className="broadcast-time">{broadcast.time}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="broadcast-item">
                                                    <span className="broadcast-channel">放送情報</span>
                                                    <span className="broadcast-time">情報なし</span>
                                                </div>
                                            )}
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
                                        <Link href={`/works/${item.id}`} className="on-air-title-link">
                                            {item.title}
                                        </Link>
                                        {item.role && <span className="on-air-role">{item.role}</span>}
                                        <div className="broadcast-info">
                                            {item.broadcasts && item.broadcasts.length > 0 ? (
                                                item.broadcasts.map((broadcast, index) => (
                                                    <div className="broadcast-item" key={index}>
                                                        {broadcast.officialUrl ? (
                                                            <a 
                                                                href={broadcast.officialUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="broadcast-channel-link"
                                                            >
                                                                {getBroadcastIcon(broadcast.channel)}
                                                                {broadcast.channel}
                                                            </a>
                                                        ) : (
                                                            <span className="broadcast-channel">
                                                                {getBroadcastIcon(broadcast.channel)}
                                                                {broadcast.channel}
                                                            </span>
                                                        )}
                                                        <span className="broadcast-time">{broadcast.time}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="broadcast-item">
                                                    <span className="broadcast-channel">放送情報</span>
                                                    <span className="broadcast-time">情報なし</span>
                                                </div>
                                            )}
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