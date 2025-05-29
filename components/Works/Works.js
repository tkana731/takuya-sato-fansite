// components/Works/Works.js
import { useState, useRef, forwardRef } from 'react';
import Link from 'next/link';

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
                            {works.anime && works.anime.slice(0, 10).map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.roles ? (
                                        item.roles.map((role, index) => (
                                            <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                        ))
                                    ) : (
                                        <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    )}
                                    <span className="item-year">{item.year}</span>
                                </li>
                            ))}
                        </ul>
                        {works.anime && works.anime.length > 10 && (
                            <div className="more-indicator">
                                <p className="text-center text-gray-600 mt-4">...他 {works.anime.length - 10}作品</p>
                            </div>
                        )}
                    </div>
                </div>

                <div id="game-content" className={`works-content ${activeTab === 'game' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">ゲーム出演作品一覧</h3>
                        <ul className="list-items">
                            {works.game && works.game.slice(0, 10).map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.roles ? (
                                        item.roles.map((role, index) => (
                                            <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                        ))
                                    ) : (
                                        <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    )}
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                        {works.game && works.game.length > 10 && (
                            <div className="more-indicator">
                                <p className="text-center text-gray-600 mt-4">...他 {works.game.length - 10}作品</p>
                            </div>
                        )}
                    </div>
                </div>

                <div id="dub-content" className={`works-content ${activeTab === 'dub' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">海外映画吹き替え</h3>
                        <ul className="list-items">
                            {works.dub && works.dub.movie && works.dub.movie.slice(0, 5).map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.roles ? (
                                        item.roles.map((role, index) => (
                                            <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                        ))
                                    ) : (
                                        <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    )}
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                        {works.dub && works.dub.movie && works.dub.movie.length > 5 && (
                            <div className="more-indicator">
                                <p className="text-center text-gray-600 mt-2">...他 {works.dub.movie.length - 5}作品</p>
                            </div>
                        )}

                        <h3 className="list-title">海外ドラマ吹き替え</h3>
                        <ul className="list-items">
                            {works.dub && works.dub.drama && works.dub.drama.slice(0, 5).map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.roles ? (
                                        item.roles.map((role, index) => (
                                            <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                        ))
                                    ) : (
                                        <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    )}
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                        {works.dub && works.dub.drama && works.dub.drama.length > 5 && (
                            <div className="more-indicator">
                                <p className="text-center text-gray-600 mt-2">...他 {works.dub.drama.length - 5}作品</p>
                            </div>
                        )}

                        {works.dub && works.dub.anime && works.dub.anime.length > 0 && (
                            <>
                                <h3 className="list-title">海外アニメ吹き替え</h3>
                                <ul className="list-items">
                                    {works.dub.anime.slice(0, 5).map(item => (
                                        <li className="list-item" key={item.id}>
                                            <span className="item-title">{item.title}</span>
                                            {item.roles ? (
                                                item.roles.map((role, index) => (
                                                    <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                                ))
                                            ) : (
                                                <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                            )}
                                            {item.year && <span className="item-year">{item.year}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {works.dub.anime.length > 5 && (
                                    <div className="more-indicator">
                                        <p className="text-center text-gray-600 mt-2">...他 {works.dub.anime.length - 5}作品</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div id="other-content" className={`works-content ${activeTab === 'other' ? 'active' : ''}`}>
                    <div className="works-list">
                        {works.other && works.other.special && works.other.special.length > 0 && (
                            <>
                                <h3 className="list-title">特撮/舞台</h3>
                                <ul className="list-items">
                                    {works.other.special.slice(0, 5).map(item => (
                                        <li className="list-item" key={item.id}>
                                            <span className="item-title">{item.title}</span>
                                            {item.roles ? (
                                                item.roles.map((role, index) => (
                                                    <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                                ))
                                            ) : (
                                                <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                            )}
                                            {item.year && <span className="item-year">{item.year}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {works.other.special.length > 5 && (
                                    <div className="more-indicator">
                                        <p className="text-center text-gray-600 mt-2">...他 {works.other.special.length - 5}作品</p>
                                    </div>
                                )}
                            </>
                        )}

                        {works.other && works.other.radio && works.other.radio.length > 0 && (
                            <>
                                <h3 className="list-title">ラジオ・配信番組</h3>
                                <ul className="list-items">
                                    {works.other.radio.slice(0, 5).map(item => (
                                        <li className="list-item" key={item.id}>
                                            <span className="item-title">{item.title}</span>
                                            {item.role && <span className="item-role">{item.role}</span>}
                                            {item.year && <span className="item-year">{item.year}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {works.other.radio.length > 5 && (
                                    <div className="more-indicator">
                                        <p className="text-center text-gray-600 mt-2">...他 {works.other.radio.length - 5}作品</p>
                                    </div>
                                )}
                            </>
                        )}

                        {works.other && works.other.voice && works.other.voice.length > 0 && (
                            <>
                                <h3 className="list-title">ナレーション・ボイスオーバー</h3>
                                <ul className="list-items">
                                    {works.other.voice.slice(0, 5).map(item => (
                                        <li className="list-item" key={item.id}>
                                            <span className="item-title">{item.title}</span>
                                            {item.role && <span className="item-role">{item.role}</span>}
                                            {item.year && <span className="item-year">{item.year}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {works.other.voice.length > 5 && (
                                    <div className="more-indicator">
                                        <p className="text-center text-gray-600 mt-2">...他 {works.other.voice.length - 5}作品</p>
                                    </div>
                                )}
                            </>
                        )}

                        {works.other && works.other.comic && works.other.comic.length > 0 && (
                            <>
                                <h3 className="list-title">ボイスコミック</h3>
                                <ul className="list-items">
                                    {works.other.comic.slice(0, 5).map(item => (
                                        <li className="list-item" key={item.id}>
                                            <span className="item-title">{item.title}</span>
                                            {item.roles ? (
                                                item.roles.map((role, index) => (
                                                    <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                                ))
                                            ) : (
                                                <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                            )}
                                            {item.year && <span className="item-year">{item.year}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {works.other.comic.length > 5 && (
                                    <div className="more-indicator">
                                        <p className="text-center text-gray-600 mt-2">...他 {works.other.comic.length - 5}作品</p>
                                    </div>
                                )}
                            </>
                        )}

                        {works.other && works.other.drama && works.other.drama.length > 0 && (
                            <>
                                <h3 className="list-title">ドラマ</h3>
                                <ul className="list-items">
                                    {works.other.drama.slice(0, 5).map(item => (
                                        <li className="list-item" key={item.id}>
                                            <span className="item-title">{item.title}</span>
                                            {item.role && <span className="item-role">{item.role}</span>}
                                            {item.year && <span className="item-year">{item.year}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {works.other.drama.length > 5 && (
                                    <div className="more-indicator">
                                        <p className="text-center text-gray-600 mt-2">...他 {works.other.drama.length - 5}作品</p>
                                    </div>
                                )}
                            </>
                        )}

                        {works.other && works.other.dramaCD && works.other.dramaCD.length > 0 && (
                            <>
                                <h3 className="list-title">ドラマCD</h3>
                                <ul className="list-items">
                                    {works.other.dramaCD.slice(0, 5).map(item => (
                                        <li className="list-item" key={item.id}>
                                            <span className="item-title">{item.title}</span>
                                            {item.roles ? (
                                                item.roles.map((role, index) => (
                                                    <span key={index} className={`item-role ${role.isMain ? 'main' : ''}`}>{role.name}</span>
                                                ))
                                            ) : (
                                                <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                            )}
                                            {item.year && <span className="item-year">{item.year}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {works.other.dramaCD.length > 5 && (
                                    <div className="more-indicator">
                                        <p className="text-center text-gray-600 mt-2">...他 {works.other.dramaCD.length - 5}作品</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* VIEW ALLボタンを復活 */}
                <div className="view-all-container">
                    <Link href="/works" className="view-all">VIEW ALL</Link>
                </div>
            </div>
        </section>
    );
});

Works.displayName = 'Works';

export default Works;