import { useState } from 'react';
import Link from 'next/link';

export default function SocialPosts({ posts = [], limit = 6, showFilters = false }) {
  const [filters, setFilters] = useState({
    platform: ''
  });

  // フィルタリングされた投稿
  const filteredPosts = posts.filter(post => {
    if (filters.platform && post.platform !== filters.platform) {
      return false;
    }
    return true;
  });

  // 表示する投稿（制限適用）
  const displayPosts = limit ? filteredPosts.slice(0, limit) : filteredPosts;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const extractTweetId = (url) => {
    if (!url) return null;
    const match = url.match(/twitter\.com\/\w+\/status\/(\d+)|x\.com\/\w+\/status\/(\d+)/);
    return match ? (match[1] || match[2]) : null;
  };

  const getPlatformIcon = (platform) => {
    return platform === 'x' ? '𝕏' : '📷';
  };

  return (
    <section className="youtube-section" id="social-posts">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">SOCIAL POSTS</h2>
          <p className="section-subtitle">ソーシャルメディア投稿</p>
        </div>

        {showFilters && (
          <div className="year-tabs-wrapper">
            <div className="year-tabs filter-tabs">
              <button
                className={`year-tab ${filters.platform === '' ? 'active' : ''}`}
                onClick={() => handleFilterChange('platform', '')}
              >
                <span className="tab-text">すべて</span>
              </button>
              <button
                className={`year-tab ${filters.platform === 'x' ? 'active' : ''}`}
                onClick={() => handleFilterChange('platform', 'x')}
              >
                <span className="tab-text">𝕏 Twitter</span>
              </button>
              <button
                className={`year-tab ${filters.platform === 'instagram' ? 'active' : ''}`}
                onClick={() => handleFilterChange('platform', 'instagram')}
              >
                <span className="tab-text">📷 Instagram</span>
              </button>
            </div>
          </div>
        )}

        {displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post) => {
              const tweetId = extractTweetId(post.postUrl);
              
              return (
                <div key={post.id} className="mb-6">
                  {post.platform === 'x' && tweetId ? (
                    // X（Twitter）投稿の埋め込み
                    <iframe
                      src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&width=550`}
                      width="100%"
                      height="550"
                      style={{ 
                        border: 'none', 
                        borderRadius: '12px'
                      }}
                      loading="lazy"
                      title="X Post"
                    />
                  ) : (
                    // Instagram やその他のプラットフォーム
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: '500px', 
                      backgroundColor: post.platform === 'instagram' ? '#E4405F' : '#1DA1F2',
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '30px'
                    }}>
                      <div style={{ fontSize: '5rem', marginBottom: '30px' }}>
                        {getPlatformIcon(post.platform)}
                      </div>
                      {post.work && (
                        <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
                          {post.work.title}
                        </p>
                      )}
                      <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
                        {formatDate(post.publishedAt)}
                      </p>
                      <a 
                        href={post.postUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          color: 'white', 
                          textDecoration: 'underline',
                          fontSize: '1rem'
                        }}
                      >
                        投稿を見る →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>投稿が見つかりませんでした</p>
          </div>
        )}

        {!showFilters && (
          <div className="view-all-container">
            <Link href="/social-posts" className="view-all">VIEW ALL</Link>
          </div>
        )}
      </div>
    </section>
  );
}