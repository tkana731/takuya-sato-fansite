// components/Video/VideoSection.js
import Link from 'next/link';

export default function VideoSection({ videos = [] }) {
    // APIから取得したデータがない場合のフォールバックデータ
    const fallbackVideo = videos.length ? videos : {
        id: '1',
        title: '【声優】佐藤拓也の声優としての魅力に迫る！',
        date: '2025.05.08',
        thumbnailUrl: '/api/placeholder/400/225'
    };

    return (
        <section className="youtube-section" id="video">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">VIDEO</h2>
                    <p className="section-subtitle">最新動画</p>
                    <a href="#" className="view-all">VIEW ALL</a>
                </div>
                <div className="youtube-grid">
                    <div className="youtube-card">
                        <div className="youtube-thumbnail">
                            <img src={fallbackVideo.thumbnailUrl} alt="佐藤拓也 最新動画" />
                            <div className="play-button">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <polygon points="5 3 19 12 5 21 5 3" fill="white"></polygon>
                                </svg>
                            </div>
                        </div>
                        <div className="youtube-content">
                            <h3 className="youtube-title">{fallbackVideo.title}</h3>
                            <p className="youtube-date">{fallbackVideo.date}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}