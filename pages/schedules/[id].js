// pages/schedules/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import SEO from '../../components/SEO/SEO';
import SchemaOrg from '../../components/SEO/SchemaOrg';
import CalendarButton from '../../components/CalendarButton/CalendarButton';
import { FaCalendarAlt, FaExternalLinkAlt, FaMapMarkerAlt, FaClock, FaUsers, FaInfo, FaHome, FaTwitter, FaFacebook, FaLine, FaShareAlt, FaInstagram } from 'react-icons/fa';

export default function ScheduleDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchSchedule = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/schedules/${id}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('スケジュールが見つかりません');
                    } else {
                        setError('スケジュールの取得に失敗しました');
                    }
                    return;
                }

                const data = await response.json();
                setSchedule(data);
            } catch (error) {
                console.error('スケジュール取得エラー:', error);
                setError('スケジュールの取得中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [id]);

    // ローディング中
    if (loading) {
        return (
            <Layout>
                <SEO 
                    title="スケジュール詳細 | 佐藤拓也さん非公式ファンサイト"
                    description="佐藤拓也さんのスケジュール詳細情報を表示しています。"
                />
                <div className="container">
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>スケジュールを読み込み中...</p>
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
                    description="スケジュールの取得中にエラーが発生しました。"
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

    // スケジュールが見つからない場合
    if (!schedule) {
        return (
            <Layout>
                <SEO 
                    title="スケジュールが見つかりません | 佐藤拓也さん非公式ファンサイト"
                    description="指定されたスケジュールが見つかりませんでした。"
                />
                <div className="container">
                    <div className="not-found">
                        <h1>スケジュールが見つかりません</h1>
                        <p>指定されたスケジュールは存在しないか、削除された可能性があります。</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // 日付・時刻の表示用フォーマット
    const formatDateForDisplay = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const formatTimeForDisplay = (timeStr) => {
        if (timeStr === '00:00') return '';
        return timeStr;
    };

    // SNSシェア機能
    const getShareData = () => {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        const dateText = schedule.isLongTerm 
            ? `${formatDateForDisplay(schedule.date)}〜${formatDateForDisplay(schedule.endDate)}`
            : `${formatDateForDisplay(schedule.date)} (${schedule.weekday})`;
        
        const shareText = `佐藤拓也さん出演「${schedule.title}」\n${dateText}\n${schedule.location ? `会場: ${schedule.location}` : ''}`;
        
        return {
            url: currentUrl,
            text: shareText,
            title: schedule.title
        };
    };

    const handleShare = (platform) => {
        const { url, text, title } = getShareData();
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);
        const encodedTitle = encodeURIComponent(title);

        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
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
                } else {
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
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };


    // カスタムパンくずリスト
    const customBreadcrumb = [
        { label: 'HOME', path: '/', icon: FaHome },
        { label: 'SCHEDULE', path: '/schedule' },
        { label: schedule.title, path: `/schedules/${id}` }
    ];

    // メタデータ生成
    const title = `${schedule.title} | 佐藤拓也さん非公式ファンサイト`;
    const description = `${schedule.title}の詳細情報。${formatDateForDisplay(schedule.date)} ${schedule.weekday} ${schedule.time && !schedule.isAllDay ? schedule.time : ''}${schedule.location ? ` at ${schedule.location}` : ''}`;

    return (
        <Layout customBreadcrumb={customBreadcrumb}>
            <SEO 
                title={title}
                description={description}
                keywords={`佐藤拓也,スケジュール,${schedule.categoryName},${schedule.title}`}
            />
            <SchemaOrg 
                type="Event"
                data={{
                    name: schedule.title,
                    startDate: schedule.datetime,
                    endDate: schedule.endDatetime,
                    location: schedule.location,
                    description: schedule.description || title,
                    performer: '佐藤拓也',
                    eventStatus: schedule.periodStatus === 'ended' ? 'EventCancelled' : 'EventScheduled'
                }}
            />

            <div className="container">
                <div className="schedule-detail">
                    {/* メイン情報 */}
                    <div className="schedule-detail-content">
                        {/* ヘッダー部分 */}
                        <div className="schedule-detail-header">
                            <h1 className="schedule-title">{schedule.title}</h1>
                            <div className="header-badges">
                                <div className="category-badge" style={{ backgroundColor: schedule.categoryColor || 'var(--primary-color)' }}>
                                    {schedule.categoryName}
                                </div>
                                {schedule.isLongTerm && (
                                    <span className={`period-badge ${schedule.periodStatus}`}>
                                        {schedule.periodStatus === 'ongoing' ? '開催中' :
                                         schedule.periodStatus === 'upcoming' ? '開催予定' :
                                         '終了'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="schedule-info-section">
                            <div className="info-grid">
                                {/* 日時情報 */}
                                <div className="info-item">
                                    <div className="info-icon">
                                        <FaCalendarAlt />
                                    </div>
                                    <div className="info-content">
                                        <div className="info-label">{schedule.isLongTerm ? '開催期間' : '日時'}</div>
                                        <div className="info-value">
                                            {schedule.isLongTerm ? (
                                                <div className="period-date-range">
                                                    {formatDateForDisplay(schedule.date)} ({schedule.weekday})
                                                    {!schedule.isAllDay && schedule.time && (
                                                        <span className="time-info"> {formatTimeForDisplay(schedule.time)}</span>
                                                    )}
                                                    <span className="period-separator"> 〜 </span>
                                                    {formatDateForDisplay(schedule.endDate)} 
                                                    {schedule.endWeekday && (
                                                        <span> ({schedule.endWeekday})</span>
                                                    )}
                                                    {!schedule.isAllDay && schedule.endTime && (
                                                        <span className="time-info"> {formatTimeForDisplay(schedule.endTime)}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    {formatDateForDisplay(schedule.date)} ({schedule.weekday})
                                                    {!schedule.isAllDay && schedule.time && (
                                                        <span className="time-info"> {formatTimeForDisplay(schedule.time)}</span>
                                                    )}
                                                    {schedule.isAllDay && (
                                                        <span className="all-day-badge">終日</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 会場/配信情報 */}
                                {schedule.location && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">{schedule.locationType}</div>
                                            <div className="info-value">
                                                {schedule.location}
                                                {schedule.prefecture && (
                                                    <span className="prefecture">（{schedule.prefecture}）</span>
                                                )}
                                            </div>
                                            {schedule.address && (
                                                <div className="address">{schedule.address}</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 出演者情報 */}
                                {schedule.performers && schedule.performers.length > 0 && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <FaUsers />
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">出演者</div>
                                            <div className="info-value">
                                                <div className="performers-list">
                                                    {schedule.performers.map((performer, index) => (
                                                        <div key={index} className={`performer ${performer.isTakuyaSato ? 'takuya-sato' : ''}`}>
                                                            <span className="performer-name">{performer.name}</span>
                                                            {performer.role && (
                                                                <span className="performer-role">（{performer.role}）</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 詳細情報 */}
                                {schedule.description && (
                                    <div className="info-item">
                                        <div className="info-icon">
                                            <FaInfo />
                                        </div>
                                        <div className="info-content">
                                            <div className="info-label">詳細情報</div>
                                            <div className="info-value">
                                                {schedule.description.split('\n').map((line, index) => (
                                                    <p key={index} style={{ margin: '0 0 8px 0', lineHeight: '1.6' }}>{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* アクセス情報 */}
                        {schedule.accessInfo && (
                            <div className="schedule-access-section">
                                <div className="schedule-section-header">
                                    <FaMapMarkerAlt />
                                    <h2>アクセス</h2>
                                </div>
                                <div className="access-content">
                                    {schedule.accessInfo.split('\n').map((line, index) => (
                                        <p key={index}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* アクションボタン */}
                        <div className="schedule-actions">
                            {schedule.officialUrl && (
                                <a
                                    href={schedule.officialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="schedule-link-button"
                                    title="関連リンク（外部サイト）"
                                    aria-label="関連リンク（外部サイト）"
                                >
                                    <FaExternalLinkAlt />
                                    <span className="button-text">関連リンク</span>
                                </a>
                            )}
                            
                            <CalendarButton schedule={{
                                id: schedule.id,
                                title: schedule.title,
                                datetime: schedule.datetime,
                                endDatetime: schedule.endDatetime,
                                location: schedule.location,
                                description: schedule.description,
                                time: schedule.time,
                                isAllDay: schedule.isAllDay
                            }} />
                        </div>

                        {/* SNSシェアボタン */}
                        <div className="schedule-share-section">
                            <div className="share-section-header">
                                <FaShareAlt />
                                <h3>このスケジュールをシェア</h3>
                            </div>
                            <div className="share-buttons">
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="share-button twitter"
                                    title="Twitterでシェア"
                                    aria-label="Twitterでシェア"
                                >
                                    <FaTwitter />
                                    <span>Twitter</span>
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