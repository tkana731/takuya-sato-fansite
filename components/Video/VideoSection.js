// components/Video/VideoSection.js
import { useState } from 'react';
import Link from 'next/link';

export default function VideoSection({ videos = [] }) {
    // 動画データが存在するかチェック
    const hasVideos = Array.isArray(videos) && videos.length > 0;

    // YouTube動画IDを抽出する関数
    const extractYoutubeVideoId = (url) => {
        if (!url) return null;

        // YouTubeのURLパターンにマッチする正規表現
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        // マッチして、かつビデオIDが11文字の場合はIDを返す
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <section className="youtube-section" id="video">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">VIDEO</h2>
                    <p className="section-subtitle">最新動画</p>
                    <a href="#" className="view-all">VIEW ALL</a>
                </div>

                {hasVideos ? (
                    <div className="youtube-grid">
                        {videos.map(video => {
                            // 動画URLからビデオIDを取得
                            const videoId = extractYoutubeVideoId(video.videoUrl);

                            // 埋め込みURLを生成
                            const embedUrl = videoId
                                ? `https://www.youtube.com/embed/${videoId}`
                                : null;

                            return (
                                <div className="youtube-card" key={video.id}>
                                    <div className="youtube-thumbnail">
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
                                    <div className="youtube-content">
                                        <h3 className="youtube-title">{video.title}</h3>
                                        <p className="youtube-date">{video.date}</p>
                                        {video.workTitle && (
                                            <p className="text-sm text-primary-dark mt-1">
                                                <span className="font-medium">関連作品:</span> {video.workTitle}
                                            </p>
                                        )}
                                        {video.videoUrl && (
                                            <p className="mt-2">
                                                <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm">
                                                    YouTubeで視聴する →
                                                </Link>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>動画がまだありません</p>
                    </div>
                )}
            </div>
        </section>
    );
}