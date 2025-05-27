import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';

export default function CharactersPage() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    // キャラクターデータを取得
    useEffect(() => {
        async function fetchCharacters() {
            setLoading(true);
            try {
                const response = await fetch('/api/characters');
                if (!response.ok) {
                    throw new Error('キャラクターデータの取得に失敗しました');
                }
                const data = await response.json();
                setCharacters(data || []);
            } catch (err) {
                console.error('キャラクターの取得エラー:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCharacters();
    }, []);

    // 作品名でグルーピング
    const groupedCharacters = characters.reduce((acc, character) => {
        const workTitle = character.workTitle || 'その他';
        if (!acc[workTitle]) {
            acc[workTitle] = [];
        }
        acc[workTitle].push(character);
        return acc;
    }, {});

    // 作品名をソート
    const sortedWorkTitles = Object.keys(groupedCharacters).sort((a, b) => {
        if (a === 'その他') return 1;
        if (b === 'その他') return -1;
        return a.localeCompare(b, 'ja');
    });

    // メディアタイプを抽出して display_order で並べ替え
    const getMediaTypes = () => {
        const typeMap = new Map();
        characters.forEach(character => {
            if (character.mediaType && !typeMap.has(character.mediaType)) {
                typeMap.set(character.mediaType, character.mediaTypeOrder || 999);
            }
        });
        
        // display_order の昇順でソート
        return Array.from(typeMap.entries())
            .sort((a, b) => a[1] - b[1])
            .map(entry => entry[0]);
    };

    const mediaTypes = getMediaTypes();

    // フィルタリング機能
    const filterCharacters = () => {
        if (activeFilter === 'all') {
            return sortedWorkTitles;
        }
        return sortedWorkTitles.filter(workTitle => {
            const workCharacters = groupedCharacters[workTitle];
            return workCharacters.some(character => character.mediaType === activeFilter);
        });
    };

    const filteredWorkTitles = filterCharacters();

    // 誕生日のフォーマット
    const formatBirthday = (birthday) => {
        if (!birthday) return '不明';
        const date = new Date(birthday);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    // ページのメタデータ
    const pageTitle = '佐藤拓也さんが演じるキャラクター一覧 | 非公式ファンサイト';
    const pageDescription = '声優・佐藤拓也さんが演じたアニメ・ゲームキャラクターの一覧です。キャラクター名、作品名、誕生日などの情報をまとめています。';

    // 構造化データを作成
    const createCharacterSchemaData = () => {
        if (!characters.length) return null;

        return {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: '佐藤拓也さんが演じるキャラクター一覧',
            description: pageDescription,
            numberOfItems: characters.length,
            itemListElement: characters.map((character, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Person',
                    name: character.name,
                    description: `${character.workTitle}のキャラクター`,
                    performer: {
                        '@type': 'Person',
                        name: '佐藤拓也'
                    }
                }
            }))
        };
    };

    return (
        <Layout>
            <SEO
                title={pageTitle}
                description={pageDescription}
                type="article"
            />
            {characters.length > 0 && (
                <SchemaOrg
                    type="ItemList"
                    data={createCharacterSchemaData()}
                />
            )}

            <section className="characters-page-section">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">CHARACTERS</h1>
                        <p className="section-subtitle">キャラクター一覧</p>
                    </div>

                    {/* フィルタータブ */}
                    {mediaTypes.length > 0 && (
                        <div className="filter-tabs-wrapper">
                            <div className="filter-tabs" role="tablist" aria-label="メディアタイプフィルター">
                                <button
                                    className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveFilter('all')}
                                    role="tab"
                                    aria-selected={activeFilter === 'all'}
                                >
                                    <span className="tab-text">すべて</span>
                                </button>
                                {mediaTypes.map(type => (
                                    <button
                                        key={type}
                                        className={`filter-tab ${activeFilter === type ? 'active' : ''}`}
                                        onClick={() => setActiveFilter(type)}
                                        role="tab"
                                        aria-selected={activeFilter === type}
                                    >
                                        <span className="tab-text">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                        <div className="characters-container">
                            {filteredWorkTitles.length > 0 ? (
                                filteredWorkTitles.map(workTitle => {
                                    const workCharacters = groupedCharacters[workTitle].filter(character =>
                                        activeFilter === 'all' || character.mediaType === activeFilter
                                    );

                                    if (workCharacters.length === 0) return null;

                                    return (
                                        <div key={workTitle} className="work-group">
                                            <h3 className="work-group-title">{workTitle}</h3>
                                            <div className="characters-grid">
                                                {workCharacters.map(character => (
                                                    <div className="character-card" key={character.id}>
                                                        <div className="character-content">
                                                            <h4 className="character-name">{character.name}</h4>
                                                            <p className="character-info">
                                                                <span className="info-label">作品:</span>
                                                                <span className="info-value">{character.workTitle}</span>
                                                            </p>
                                                            {character.birthday && (
                                                                <p className="character-info">
                                                                    <span className="info-label">誕生日:</span>
                                                                    <span className="info-value">{formatBirthday(character.birthday)}</span>
                                                                </p>
                                                            )}
                                                            {character.mediaType && (
                                                                <span className={`media-type-badge ${character.mediaType.toLowerCase()}`}>
                                                                    {character.mediaType}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-characters">該当するキャラクターがありません。</div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}