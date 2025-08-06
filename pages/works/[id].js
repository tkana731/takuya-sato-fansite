// pages/works/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import SEO from '../../components/SEO/SEO';
import SchemaOrg from '../../components/SEO/SchemaOrg';
import Link from 'next/link';
import { FaExternalLinkAlt, FaHome, FaMusic, FaShoppingCart, FaUsers, FaUser, FaCalendarAlt, FaTv, FaGamepad, FaFilm, FaMicrophone, FaInfo, FaShareAlt, FaFacebook, FaLine, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function WorkDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // SNSシェア機能
    const getShareData = () => {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        const shareText = `佐藤拓也さん出演「${work?.title}」\nメディア: ${work?.categoryName || ''}`;
        
        return {
            url: currentUrl,
            text: shareText,
            title: work?.title || ''
        };
    };

    const handleShare = (platform) => {
        const { url, text, title } = getShareData();
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);
        // const encodedTitle = encodeURIComponent(title); // 未使用のため削除

        let shareUrl = '';
        
        switch (platform) {
            case 'x':
                shareUrl = `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'line':
                shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;
                break;
            case 'instagram':
                // InstagramはWebからの直接シェアが制限されているため、URLをクリップボードにコピー
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        alert('URLをクリップボードにコピーしました。Instagramアプリで投稿してください。');
                    }).catch(() => {
                        alert('URLのコピーに失敗しました。');
                    });
                } else {
                    alert('お使いのブラウザではクリップボード機能がサポートされていません。');
                }
                return;
            default:
                // Web Share API（対応ブラウザの場合）
                if (navigator.share) {
                    navigator.share({
                        title: title,
                        text: text,
                        url: url
                    }).catch(console.error);
                    return;
                }
                // Web Share APIが利用できない場合はURLをクリップボードにコピー
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                        alert('URLをクリップボードにコピーしました。');
                    }).catch(() => {
                        alert('URLのコピーに失敗しました。');
                    });
                } else {
                    alert('お使いのブラウザではクリップボード機能がサポートされていません。');
                }
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchWork = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/works/${id}?detail=true`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('作品が見つかりません');
                    } else {
                        setError('作品の取得に失敗しました');
                    }
                    return;
                }

                const result = await response.json();
                setWork(result.data);
            } catch (error) {
                console.error('作品取得エラー:', error);
                setError('作品の取得中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchWork();
    }, [id]);

    // ローディング中
    if (loading) {
        return (
            <Layout>
                <SEO 
                    title="作品詳細 | 佐藤拓也さん非公式ファンサイト"
                    description="佐藤拓也さんの作品詳細情報を表示しています。"
                />
                <div className="container">
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>作品を読み込み中...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // エラー表示
    if (error) {
        return (
            <Layout>
                <SEO 
                    title="エラー | 佐藤拓也さん非公式ファンサイト"
                    description="作品の取得中にエラーが発生しました。"
                />
                <div className="container">
                    <div className="error">
                        <h1>エラー</h1>
                        <p>{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // 作品が見つからない場合
    if (!work) {
        return (
            <Layout>
                <SEO 
                    title="作品が見つかりません | 佐藤拓也さん非公式ファンサイト"
                    description="指定された作品が見つかりませんでした。"
                />
                <div className="container">
                    <div className="not-found">
                        <h1>作品が見つかりません</h1>
                        <p>指定された作品は存在しないか、削除された可能性があります。</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // カテゴリカラーを取得
    const getCategoryColor = (workType) => {
        const colors = {
            'anime': '#4A90E2',
            'game': '#E94B3C',
            'dub': '#F39C12',
            'other': '#27AE60'
        };
        return colors[workType] || '#6C757D';
    };

    // 楽曲タイプの表示名を取得
    const getSongTypeLabel = (songType) => {
        const labels = {
            'op': 'オープニング',
            'ed': 'エンディング',
            'insert': '挿入歌',
            'character': 'キャラクターソング',
            'other': 'その他'
        };
        return labels[songType] || songType;
    };

    // カスタムパンくずリスト
    const customBreadcrumb = [
        { label: 'HOME', path: '/', icon: FaHome },
        { label: 'WORKS', path: '/works' },
        { label: work.title, path: `/works/${work.id}` }
    ];

    return (
        <Layout customBreadcrumb={customBreadcrumb}>
            <SEO 
                title={`${work.title} | 佐藤拓也さん非公式ファンサイト`}
                description={work.description || `佐藤拓也さん出演作品「${work.title}」の詳細情報。キャスト、スタッフ、関連楽曲、関連商品などの情報を掲載しています。`}
                ogImage={work.officialUrl ? undefined : undefined}
            />
            <SchemaOrg 
                type="work"
                data={work}
            />

            <div className="container">
                <div className="schedule-detail">
                    {/* メイン情報 */}
                    <div className="schedule-detail-content">
                        {/* ヘッダー部分 */}
                        <div className="schedule-detail-header">
                            <h1 className="schedule-title">{work.title}</h1>
                            <div className="header-badges">
                                <div className="category-badge" style={{ backgroundColor: getCategoryColor(work.workType) }}>
                                    {work.category?.name || '作品'}
                                </div>
                                {work.isNew && (
                                    <span className="status-badge new">NEW</span>
                                )}
                                {work.isRebroadcast && (
                                    <span className="status-badge rebroadcast">再放送</span>
                                )}
                            </div>
                        </div>

                        <div className="schedule-info-section">
                            <div className="info-grid">
                                {/* 基本情報 */}
                                {work.broadcastPeriod && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <FaCalendarAlt />
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">{work.categoryName === 'ゲーム' ? 'リリース年' : '放送開始年'}</div>
                                            <div className="info-value">{work.broadcastPeriod}</div>
                                        </div>
                                    </div>
                                )}
                                {work.broadcastStations && work.broadcastStations.length > 0 && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <FaTv />
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">放送局</div>
                                            <div className="info-value">
                                                {work.broadcastStations.map((station, index) => (
                                                    <div key={index} className="broadcast-station-item">
                                                        {station}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {work.productionCompany && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <FaUsers />
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">制作会社</div>
                                            <div className="info-value">{work.productionCompany}</div>
                                        </div>
                                    </div>
                                )}

                                {/* 役名情報 */}
                                {work.performers && work.performers.length > 0 && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <FaUser />
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">役名</div>
                                            <div className="info-value">
                                                {work.performers.map((performer, index) => (
                                                    <span key={index} className={`item-role ${performer.roleType === 'main' ? 'main' : ''}`}>
                                                        {performer.character || performer.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* スタッフ情報 */}
                                {work.staff && Object.keys(work.staff).length > 0 && 
                                    Object.entries(work.staff).map(([role, names]) => (
                                        <div key={role} className="info-item">
                                            <div className="info-icon">
                                                <FaUsers />
                                            </div>
                                            <div className="info-content">
                                                <div className="info-label">{role}</div>
                                                <div className="info-value">{names.join('、')}</div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* 説明 */}
                        {work.description && (
                            <div className="schedule-description-wrapper">
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaInfo /></span>
                                    <p className="schedule-description">{work.description}</p>
                                </div>
                            </div>
                        )}

                        {/* 関連楽曲 */}
                        {work.songs && Object.keys(work.songs).length > 0 && (
                            <div className="schedule-description-wrapper">
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaMusic /></span>
                                    <div className="songs-info">
                                        {Object.entries(work.songs).map(([type, songs]) => (
                                            <div key={type} className="song-type-group">
                                                <span className="song-type-label">{getSongTypeLabel(type)}:</span>
                                                <div className="song-items">
                                                    {songs.map((song, index) => (
                                                        <span key={song.id} className="song-item">
                                                            {song.title}
                                                            {song.artist && song.artist !== 'artist' && ` (${song.artist})`}
                                                            {index < songs.length - 1 && '、'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 関連商品 */}
                        {work.relatedProducts && work.relatedProducts.length > 0 && (
                            <div className="schedule-description-wrapper">
                                <div className="schedule-detail-item">
                                    <span className="detail-icon"><FaShoppingCart /></span>
                                    <div className="products-info">
                                        {work.relatedProducts.map((product, index) => (
                                            <span key={product.id} className="product-item">
                                                {product.title} ({product.category})
                                                {index < work.relatedProducts.length - 1 && '、'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* アクションボタン */}
                        <div className="schedule-actions">
                            {work.officialUrl && (
                                <a
                                    href={work.officialUrl}
                                    className="schedule-link-button"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="公式サイト（外部サイト）"
                                    aria-label="公式サイト（外部サイト）"
                                >
                                    <FaExternalLinkAlt />
                                    <span className="button-text">公式サイト</span>
                                </a>
                            )}
                        </div>

                        {/* SNSシェアボタン */}
                        <div className="schedule-share-section">
                            <div className="share-section-header">
                                <FaShareAlt />
                                <h3>この作品をシェア</h3>
                            </div>
                            <div className="share-buttons">
                                <button
                                    onClick={() => handleShare('x')}
                                    className="share-button x"
                                    title="Xでシェア"
                                    aria-label="Xでシェア"
                                >
                                    <FaXTwitter />
                                    <span>Post</span>
                                </button>
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="share-button facebook"
                                    title="Facebookでシェア"
                                    aria-label="Facebookでシェア"
                                >
                                    <FaFacebook />
                                    <span>Facebook</span>
                                </button>
                                <button
                                    onClick={() => handleShare('line')}
                                    className="share-button line"
                                    title="LINEでシェア"
                                    aria-label="LINEでシェア"
                                >
                                    <FaLine />
                                    <span>LINE</span>
                                </button>
                                <button
                                    onClick={() => handleShare('instagram')}
                                    className="share-button instagram"
                                    title="Instagram用にURLをコピー"
                                    aria-label="Instagram用にURLをコピー"
                                >
                                    <FaInstagram />
                                    <span>Instagram</span>
                                </button>
                                <button
                                    onClick={() => handleShare('native')}
                                    className="share-button native"
                                    title="その他のアプリでシェア / URLをコピー"
                                    aria-label="その他のアプリでシェア / URLをコピー"
                                >
                                    <FaShareAlt />
                                    <span>その他</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}