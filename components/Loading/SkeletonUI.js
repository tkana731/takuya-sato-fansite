// components/Loading/SkeletonUI.js
export default function SkeletonUI({ type = 'default', count = 1 }) {
    // スケルトン項目を表示する回数
    const items = Array.from({ length: count }, (_, i) => i);

    // スケジュールスケルトン
    if (type === 'schedule') {
        return (
            <div className="schedule-section" id="schedule-loading">
                <div className="container">
                    <div className="section-header">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-subtitle"></div>
                    </div>
                    <div className="schedule-container">
                        <div className="schedule-header">
                            <div className="skeleton-period"></div>
                        </div>
                        <div className="schedule-tabs skeleton-tabs">
                            <div className="skeleton-tab"></div>
                            <div className="skeleton-tab"></div>
                            <div className="skeleton-tab"></div>
                            <div className="skeleton-tab"></div>
                        </div>
                        <ul className="schedule-items">
                            {items.map((item) => (
                                <li key={item} className="schedule-item skeleton-item">
                                    <div className="skeleton-date"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton-title-long"></div>
                                        <div className="skeleton-text"></div>
                                        <div className="skeleton-text-short"></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // 作品スケルトン
    if (type === 'works') {
        return (
            <div className="works-section" id="works-loading">
                <div className="container">
                    <div className="section-header">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-subtitle"></div>
                    </div>
                    <div className="works-tabs skeleton-tabs">
                        <div className="skeleton-tab"></div>
                        <div className="skeleton-tab"></div>
                        <div className="skeleton-tab"></div>
                        <div className="skeleton-tab"></div>
                    </div>
                    <div className="works-content active">
                        <div className="works-list">
                            <div className="skeleton-title"></div>
                            <ul className="list-items">
                                {items.map((item) => (
                                    <li key={item} className="list-item skeleton-item">
                                        <div className="skeleton-title-long"></div>
                                        <div className="skeleton-badge"></div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 動画スケルトン
    if (type === 'video') {
        return (
            <div className="youtube-section" id="video-loading">
                <div className="container">
                    <div className="section-header">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-subtitle"></div>
                    </div>
                    <div className="youtube-grid">
                        {items.map((item) => (
                            <div key={item} className="youtube-card skeleton-card">
                                <div className="skeleton-thumbnail"></div>
                                <div className="youtube-content">
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-text-short"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // デフォルトスケルトン
    return (
        <div className="skeleton-container">
            <div className="skeleton-header">
                <div className="skeleton-title"></div>
                <div className="skeleton-subtitle"></div>
            </div>
            <div className="skeleton-content">
                {items.map((item) => (
                    <div key={item} className="skeleton-item">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-text"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}