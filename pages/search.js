import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SearchBox from '../components/Search/SearchBox';
import SearchResults from '../components/Search/SearchResults';

export default function SearchPage() {
  const router = useRouter();
  const { q: query } = router.query;
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 検索実行
  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }

      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // URLクエリの変化を監視
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  // SEO用のページ情報
  const pageTitle = query 
    ? `「${query}」の検索結果 | 佐藤拓也さん非公式ファンサイト`
    : '検索 | 佐藤拓也さん非公式ファンサイト';
  
  const pageDescription = query
    ? `「${query}」の検索結果。出演作品、スケジュール、キャラクター、楽曲、商品から検索できます。`
    : 'サイト内の出演作品、スケジュール、キャラクター、楽曲、商品を検索できます。';

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        type="website"
        contentType="search"
        keywords={query ? [query, '検索', '佐藤拓也'] : ['検索']}
      />
      
      <section className="search-page-section">
        <div className="container">
          <div className="search-content active">
            <div className="section-header">
              <h1 className="section-title">SEARCH</h1>
              <p className="section-subtitle">サイト内検索</p>
            </div>

            <div className="search-container">
              <SearchBox />
            </div>

            {isLoading && (
              <div className="loading-container">
                <div className="audio-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="loading-text">検索中...</p>
              </div>
            )}

            {error && (
              <div className="search-error">
                <h3>エラーが発生しました</h3>
                <p>{error}</p>
                <button 
                  onClick={() => query && performSearch(query)}
                  className="retry-button"
                >
                  再試行
                </button>
              </div>
            )}

            {searchResults && !isLoading && (
              <SearchResults 
                results={searchResults.results}
                query={searchResults.query}
                stats={searchResults.stats}
              />
            )}

            {!query && !isLoading && (
              <div className="search-welcome">
                <h2>検索について</h2>
                <div className="search-info">
                  <div className="search-info-item">
                    <h3>🎬 出演作品</h3>
                    <p>作品名、役名で検索できます</p>
                  </div>
                  <div className="search-info-item">
                    <h3>📅 スケジュール</h3>
                    <p>イベント名、開催場所、出演者名で検索できます</p>
                  </div>
                  <div className="search-info-item">
                    <h3>👤 キャラクター</h3>
                    <p>キャラクター名、作品名で検索できます</p>
                  </div>
                  <div className="search-info-item">
                    <h3>🎵 楽曲</h3>
                    <p>楽曲名、アーティスト名で検索できます</p>
                  </div>
                  <div className="search-info-item">
                    <h3>🛒 商品</h3>
                    <p>商品名、カテゴリで検索できます</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}