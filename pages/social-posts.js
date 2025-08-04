import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';

export default function SocialPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    platform: ''
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      if (filters.platform) params.append('platform', filters.platform);

      const response = await fetch(`/api/social-posts?${params.toString()}`);
      if (!response.ok) throw new Error('ソーシャル投稿データの取得に失敗しました');
      
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('投稿データの取得エラー:', err);
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  const extractInstagramId = (url) => {
    if (!url) return null;
    // Instagram投稿URLのパターン: https://www.instagram.com/p/[POST_ID]/
    const match = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getPlatformIcon = (platform) => {
    return platform === 'x' ? '𝕏' : '📷';
  };


  return (
    <Layout title="SNS投稿 | 佐藤拓也さん非公式ファンサイト">
      <SEO
        title="SNS投稿 | 佐藤拓也さん非公式ファンサイト"
        description="佐藤拓也さん関連のX（Twitter）・Instagram投稿一覧。写真・動画投稿をまとめて確認できます。"
        type="article"
      />
      <SchemaOrg type="CollectionPage" />

      <section className="video-page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">SOCIAL POSTS</h1>
            <p className="section-subtitle">ソーシャルメディア投稿</p>
          </div>

          {/* フィルター */}
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
            posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const tweetId = extractTweetId(post.postUrl);
                  const instagramId = extractInstagramId(post.postUrl);
                  
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
                      ) : post.platform === 'instagram' && instagramId ? (
                        // Instagram投稿の埋め込み
                        <div style={{ 
                          position: 'relative', 
                          width: '100%', 
                          paddingBottom: '100%', // 正方形のアスペクト比
                          backgroundColor: '#fafafa',
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}>
                          <iframe
                            src={`https://www.instagram.com/p/${instagramId}/embed/`}
                            width="100%"
                            height="100%"
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              border: 'none',
                              borderRadius: '12px'
                            }}
                            loading="lazy"
                            title="Instagram Post"
                            allowtransparency="true"
                          />
                        </div>
                      ) : (
                        // その他のプラットフォーム（フォールバック）
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
            )
          )}
        </div>
      </section>
    </Layout>
  );
}


