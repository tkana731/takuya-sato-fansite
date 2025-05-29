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

    // キャラクター名でグルーピング（同名でも別IDは別キャラとして扱う、ただし「（役名なし）」は例外）
    const groupedCharacters = characters.reduce((acc, character) => {
        // 「（役名なし）」の場合は名前でグルーピング、それ以外はIDを含めてグルーピング
        const groupKey = character.name === '（役名なし）' 
            ? character.name 
            : `${character.name}_${character.id.split('-')[0]}`;
        
        if (!acc[groupKey]) {
            acc[groupKey] = {
                character: {
                    id: character.id.split('-')[0], // 元のキャラクターIDを取得
                    name: character.name,
                    birthday: character.birthday
                },
                works: []
            };
        }
        
        // 作品情報を追加（重複チェック）
        if (character.workTitle && !acc[groupKey].works.some(work => work.workId === character.workId)) {
            acc[groupKey].works.push({
                workId: character.workId,
                workTitle: character.workTitle,
                mediaType: character.mediaType,
                mediaTypeOrder: character.mediaTypeOrder,
                isMainRole: character.isMainRole
            });
        }
        
        return acc;
    }, {});

    // キャラクター名をソート（表示用の名前で比較）
    const sortedCharacterNames = Object.keys(groupedCharacters).sort((a, b) => {
        const nameA = groupedCharacters[a].character.name;
        const nameB = groupedCharacters[b].character.name;
        return nameA.localeCompare(nameB, 'ja');
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
            return sortedCharacterNames;
        }
        return sortedCharacterNames.filter(groupKey => {
            const characterData = groupedCharacters[groupKey];
            return characterData.works.some(work => work.mediaType === activeFilter);
        });
    };

    const filteredCharacterNames = filterCharacters();

    // 誕生日のフォーマット
    const formatBirthday = (birthday) => {
        if (!birthday) return '不明';
        
        // MM/DD形式の場合の処理
        if (birthday.includes('/')) {
            const [month, day] = birthday.split('/');
            return `${parseInt(month, 10)}月${parseInt(day, 10)}日`;
        }
        
        // その他の形式の場合は従来の処理
        const date = new Date(birthday);
        if (isNaN(date.getTime())) {
            return '不明';
        }
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

                    {/* フィルタープルダウン */}
                    {mediaTypes.length > 0 && (
                        <div className="filters-container">
                            <div className="filter-group">
                                <label className="filter-label">作品カテゴリ：</label>
                                <select 
                                    value={activeFilter} 
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    className="filter-select"
                                    aria-label="メディアタイプフィルター"
                                >
                                    <option value="all">すべて</option>
                                    {mediaTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-result">
                                <span className="result-count">{filteredCharacterNames.length}</span>件のキャラクター
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
                            {filteredCharacterNames.length > 0 ? (
                                filteredCharacterNames.map(groupKey => {
                                    const characterData = groupedCharacters[groupKey];
                                    const filteredWorks = activeFilter === 'all' 
                                        ? characterData.works 
                                        : characterData.works.filter(work => work.mediaType === activeFilter);

                                    if (filteredWorks.length === 0) return null;

                                    return (
                                        <div key={groupKey} className="character-group">
                                            <div className="character-header">
                                                <h3 className="character-group-name">{characterData.character.name}</h3>
                                                {characterData.character.birthday && (
                                                    <p className="character-birthday">
                                                        <span className="info-label">誕生日:</span>
                                                        <span className="info-value">{formatBirthday(characterData.character.birthday)}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="works-grid">
                                                {filteredWorks.map(work => (
                                                    <div className="work-card" key={work.workId}>
                                                        <div className="work-content">
                                                            <h4 className="work-title">{work.workTitle}</h4>
                                                            {work.mediaType && (
                                                                <span className={`media-type-badge ${work.mediaType.toLowerCase()}`}>
                                                                    {work.mediaType}
                                                                </span>
                                                            )}
                                                            {work.isMainRole && (
                                                                <span className="main-role-badge">メイン</span>
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