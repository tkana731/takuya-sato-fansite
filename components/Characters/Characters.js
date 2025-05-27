import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Characters({ characters = [] }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [processedCharacters, setProcessedCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    // 初期データロード
    useEffect(() => {
        const loadCharactersData = async () => {
            try {
                setLoading(true);
                // データが渡されていない場合はAPIから取得
                if (!characters || characters.length === 0) {
                    const response = await fetch('/api/characters');
                    if (!response.ok) {
                        throw new Error('キャラクターデータの取得に失敗しました');
                    }
                    const data = await response.json();
                    setProcessedCharacters(data || []);
                } else {
                    setProcessedCharacters(characters);
                }
            } catch (error) {
                console.error('キャラクター取得エラー:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCharactersData();
    }, [characters]);

    // 作品名でグルーピング
    const groupedCharacters = processedCharacters.reduce((acc, character) => {
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

    // フィルタリング機能用：作品タイプでフィルタ
    const filterCharacters = () => {
        if (activeFilter === 'all') {
            return sortedWorkTitles;
        }
        // アニメ/ゲーム/その他などでフィルタリング可能
        return sortedWorkTitles.filter(workTitle => {
            // ここにフィルタロジックを追加
            return true;
        });
    };

    const filteredWorkTitles = filterCharacters();

    // 誕生日のフォーマット
    const formatBirthday = (birthday) => {
        if (!birthday) return '不明';
        const date = new Date(birthday);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    return (
        <section className="characters-section" id="characters">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">CHARACTERS</h2>
                    <p className="section-subtitle">キャラクター一覧</p>
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
                ) : (
                    <div className="characters-container">
                        {filteredWorkTitles.length > 0 ? (
                            filteredWorkTitles.map(workTitle => (
                                <div key={workTitle} className="work-group">
                                    <h3 className="work-title">{workTitle}</h3>
                                    <div className="characters-grid">
                                        {groupedCharacters[workTitle].map(character => (
                                            <div className="character-card" key={character.id}>
                                                <div className="character-content">
                                                    <h4 className="character-name">{character.name}</h4>
                                                    <p className="character-info">
                                                        <span className="info-label">作品:</span> {character.workTitle}
                                                    </p>
                                                    {character.birthday && (
                                                        <p className="character-info">
                                                            <span className="info-label">誕生日:</span> {formatBirthday(character.birthday)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-characters">キャラクター情報がありません。</div>
                        )}
                    </div>
                )}

                <div className="view-all-container">
                    <Link href="/characters" className="view-all">VIEW ALL</Link>
                </div>
            </div>
        </section>
    );
}