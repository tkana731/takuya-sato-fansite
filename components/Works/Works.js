// components/Works/Works.js
import { useState, useRef, forwardRef } from 'react';

const Works = forwardRef((props, ref) => {
    const { works = [] } = props;
    const [activeTab, setActiveTab] = useState('anime');
    const worksRef = useRef(null);

    // タブ切り替え処理
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <section className="works-section" id="works" ref={ref || worksRef}>
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">WORKS</h2>
                    <p className="section-subtitle">出演作品</p>
                </div>

                <div className="works-tabs">
                    <div className="works-tabs-container">
                        <button
                            className={`works-tab ${activeTab === 'anime' ? 'active' : ''}`}
                            onClick={() => handleTabChange('anime')}
                        >
                            アニメ
                        </button>
                        <button
                            className={`works-tab ${activeTab === 'game' ? 'active' : ''}`}
                            onClick={() => handleTabChange('game')}
                        >
                            ゲーム
                        </button>
                        <button
                            className={`works-tab ${activeTab === 'dub' ? 'active' : ''}`}
                            onClick={() => handleTabChange('dub')}
                        >
                            吹き替え
                        </button>
                        <button
                            className={`works-tab ${activeTab === 'other' ? 'active' : ''}`}
                            onClick={() => handleTabChange('other')}
                        >
                            その他
                        </button>
                    </div>
                </div>

                <div id="anime-content" className={`works-content ${activeTab === 'anime' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">アニメ出演作品一覧</h3>
                        <ul className="list-items">
                            {works.anime && works.anime.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    <span className="item-year">{item.year}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div id="game-content" className={`works-content ${activeTab === 'game' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">ゲーム出演作品一覧</h3>
                        <ul className="list-items">
                            {works.game && works.game.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div id="dub-content" className={`works-content ${activeTab === 'dub' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">海外映画吹き替え</h3>
                        <ul className="list-items">
                            {works.dub && works.dub.movie && works.dub.movie.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>

                        <h3 className="list-title">海外ドラマ吹き替え</h3>
                        <ul className="list-items">
                            {works.dub && works.dub.drama && works.dub.drama.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div id="other-content" className={`works-content ${activeTab === 'other' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">ナレーション</h3>
                        <ul className="list-items">
                            {works.other && works.other.narration && works.other.narration.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.role && <span className="item-role">{item.role}</span>}
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>

                        <h3 className="list-title">ラジオ・ネット配信番組</h3>
                        <ul className="list-items">
                            {works.other && works.other.radio && works.other.radio.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.role && <span className="item-role">{item.role}</span>}
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="view-all-container">
                    <a href="#" className="view-all">VIEW ALL</a>
                </div>
            </div>
        </section>
    );
});

Works.displayName = 'Works';

export default Works;