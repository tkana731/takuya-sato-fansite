// pages/works.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';

export default function WorksPage() {
    const [works, setWorks] = useState({
        anime: [],
        game: [],
        dub: {
            movie: [],
            drama: [],
            anime: []
        },
        other: {
            special: [],
            drama: [],
            radio: [],
            voice: [],
            comic: []
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('anime');

    // データ取得
    useEffect(() => {
        async function fetchWorks() {
            setLoading(true);
            try {
                console.log('WORKSページ: データ取得開始');
                const response = await fetch('/api/works');
                if (!response.ok) {
                    throw new Error('出演作品データの取得に失敗しました');
                }
                const data = await response.json();
                console.log('WORKSページ: 取得したデータ:', data);

                setWorks(data);
            } catch (err) {
                console.error('出演作品の取得エラー:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchWorks();
    }, []);

    // タブ切り替え処理
    const handleTabChange = (tab) => {
        console.log('タブ切り替え:', tab);
        setActiveTab(tab);
    };

    // メタデータの生成
    const generateMetadata = () => {
        const tabNames = {
            anime: 'アニメ',
            game: 'ゲーム',
            dub: '吹き替え',
            other: 'その他'
        };

        const currentTabName = tabNames[activeTab] || 'アニメ';
        const title = `佐藤拓也さん出演作品一覧 - ${currentTabName} | 非公式ファンサイト`;
        const description = `声優・佐藤拓也さんの${currentTabName}出演作品を一覧で掲載。役名、放送年などの詳細情報をまとめています。`;

        return { title, description };
    };

    // 構造化データの生成
    const generateSchemaData = () => {
        let allWorks = [];

        if (activeTab === 'anime') {
            allWorks = works.anime || [];
        } else if (activeTab === 'game') {
            allWorks = works.game || [];
        } else if (activeTab === 'dub') {
            allWorks = [
                ...(works.dub?.movie || []),
                ...(works.dub?.drama || []),
                ...(works.dub?.anime || [])
            ];
        } else if (activeTab === 'other') {
            allWorks = [
                ...(works.other?.special || []),
                ...(works.other?.drama || []),
                ...(works.other?.radio || []),
                ...(works.other?.voice || []),
                ...(works.other?.comic || [])
            ];
        }

        if (allWorks.length === 0) return null;

        return {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `佐藤拓也さん出演作品一覧 - ${generateMetadata().title.split(' - ')[1].split(' |')[0]}`,
            description: generateMetadata().description,
            numberOfItems: allWorks.length,
            itemListElement: allWorks.map((work, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'CreativeWork',
                    name: work.title,
                    description: work.role ? `${work.title} - ${work.role}` : work.title,
                    dateCreated: work.year ? work.year.replace('年', '') : null,
                    actor: {
                        '@type': 'Person',
                        name: '佐藤拓也'
                    }
                }
            }))
        };
    };

    const { title: pageTitle, description: pageDescription } = generateMetadata();

    return (
        <Layout>
            <SEO
                title={pageTitle}
                description={pageDescription}
                type="article"
            />
            {generateSchemaData() && (
                <SchemaOrg
                    type="CreativeWork"
                    data={generateSchemaData()}
                />
            )}

            <section className="works-page-section">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">WORKS</h1>
                        <p className="section-subtitle">出演作品一覧</p>
                    </div>

                    {/* カテゴリタブ - トップページと同じ構造 */}
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
                        <>
                            {/* アニメタブ - トップページと同じ構造 */}
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

                            {/* ゲームタブ - トップページと同じ構造 */}
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

                            {/* 吹き替えタブ - トップページと同じ構造 */}
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
                                    {works.dub && works.dub.movie && works.dub.movie.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}

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
                                    {works.dub && works.dub.drama && works.dub.drama.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}

                                    <h3 className="list-title">海外アニメ吹き替え</h3>
                                    <ul className="list-items">
                                        {works.dub && works.dub.anime && works.dub.anime.map(item => (
                                            <li className="list-item" key={item.id}>
                                                <span className="item-title">{item.title}</span>
                                                <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                                {item.year && <span className="item-year">{item.year}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    {works.dub && works.dub.anime && works.dub.anime.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}
                                </div>
                            </div>

                            {/* その他タブ - トップページと同じ構造 */}
                            <div id="other-content" className={`works-content ${activeTab === 'other' ? 'active' : ''}`}>
                                <div className="works-list">
                                    <h3 className="list-title">特撮/舞台</h3>
                                    <ul className="list-items">
                                        {works.other && works.other.special && works.other.special.map(item => (
                                            <li className="list-item" key={item.id}>
                                                <span className="item-title">{item.title}</span>
                                                <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                                {item.year && <span className="item-year">{item.year}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    {works.other && works.other.special && works.other.special.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}

                                    <h3 className="list-title">ラジオ・配信番組</h3>
                                    <ul className="list-items">
                                        {works.other && works.other.radio && works.other.radio.map(item => (
                                            <li className="list-item" key={item.id}>
                                                <span className="item-title">{item.title}</span>
                                                {item.role && <span className="item-role">{item.role}</span>}
                                                {item.year && <span className="item-year">{item.year}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    {works.other && works.other.radio && works.other.radio.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}

                                    <h3 className="list-title">ナレーション・ボイスオーバー</h3>
                                    <ul className="list-items">
                                        {works.other && works.other.voice && works.other.voice.map(item => (
                                            <li className="list-item" key={item.id}>
                                                <span className="item-title">{item.title}</span>
                                                {item.role && <span className="item-role">{item.role}</span>}
                                                {item.year && <span className="item-year">{item.year}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    {works.other && works.other.voice && works.other.voice.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}

                                    <h3 className="list-title">ボイスコミック</h3>
                                    <ul className="list-items">
                                        {works.other && works.other.comic && works.other.comic.map(item => (
                                            <li className="list-item" key={item.id}>
                                                <span className="item-title">{item.title}</span>
                                                {item.role && <span className="item-role">{item.role}</span>}
                                                {item.year && <span className="item-year">{item.year}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    {works.other && works.other.comic && works.other.comic.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}

                                    <h3 className="list-title">テレビドラマ</h3>
                                    <ul className="list-items">
                                        {works.other && works.other.drama && works.other.drama.map(item => (
                                            <li className="list-item" key={item.id}>
                                                <span className="item-title">{item.title}</span>
                                                {item.role && <span className="item-role">{item.role}</span>}
                                                {item.year && <span className="item-year">{item.year}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    {works.other && works.other.drama && works.other.drama.length === 0 && (
                                        <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </Layout>
    );
}