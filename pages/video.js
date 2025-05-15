import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';

export default function VideoPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 現在の年を取得
    const currentYear = new Date().getFullYear();

    // 固定の年リスト（2018年から現在まで、降順）
    const years = Array.from({ length: currentYear - 2018 + 1 }, (_, i) => currentYear - i);

    // 初期値は現在の年
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // 選択された年に基づいて動画を取得
    useEffect(() => {
        async function fetchVideosByYear() {
            setLoading(true);
            try {
                const response = await fetch(`/api/videos?limit=100&year=${selectedYear}`);
                if (!response.ok) {
                    throw new Error('動画データの取得に失敗しました');
                }
                const data = await response.json();
                setVideos(data);
            } catch (err) {
                console.error('動画の取得エラー:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchVideosByYear();
    }, [selectedYear]);

    // YouTube動画IDを抽出する関数
    const extractYoutubeVideoId = (url) => {
        if (!url) return null;

        // YouTubeのURLパターンにマッチする正規表現
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        // マッチして、かつビデオIDが11文字の場合はIDを返す
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // 年を変更するハンドラ
    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    return (
        <Layout title="動画一覧 - 佐藤拓也ファンサイト">
            <section className="video-page-section">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">VIDEO</h1>
                        <p className="section-subtitle">動画一覧</p>
                    </div>

                    {/* 年別タブ */}
                    <div className="year-tabs-wrapper">
                        <div className="year-tabs">
                            {years.map(year => (
                                <button
                                    key={year}
                                    className={`year-tab ${selectedYear === year ? 'active' : ''}`}
                                    onClick={() => handleYearChange(year)}
                                >
                                    <span className="tab-text">{year}年</span>
                                </button>
                            ))}
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
                        <div className="video-grid">
                            {videos.length > 0 ? (
                                videos.map(video => {
                                    // 動画URLからビデオIDを取得
                                    const videoId = extractYoutubeVideoId(video.videoUrl);

                                    // 埋め込みURLを生成
                                    const embedUrl = videoId
                                        ? `https://www.youtube.com/embed/${videoId}`
                                        : null;

                                    return (
                                        <div className="video-card" key={video.id}>
                                            <div className="video-thumbnail">
                                                {embedUrl ? (
                                                    // YouTube埋め込み
                                                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9アスペクト比 */ }}>
                                                        <iframe
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                border: 'none'
                                                            }}
                                                            src={embedUrl}
                                                            title={video.title}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    </div>
                                                ) : (
                                                    // 動画IDが取得できない場合はプレースホルダー
                                                    <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ color: '#666' }}>動画が利用できません</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="video-content">
                                                <h3 className="video-title">{video.title}</h3>
                                                <p className="video-date">{video.date}</p>
                                                {video.workTitle && (
                                                    <p className="text-sm text-primary-dark mt-1">
                                                        <span className="font-medium">関連作品:</span> {video.workTitle}
                                                    </p>
                                                )}
                                                {video.videoUrl && (
                                                    <p className="mt-2">
                                                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm">
                                                            YouTubeで視聴する →
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500 col-span-full">
                                    <p>{selectedYear}年の動画はありません</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}