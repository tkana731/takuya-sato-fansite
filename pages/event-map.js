import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';

export default function EventMapPage() {
  const [eventData, setEventData] = useState(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEventData() {
      try {
        const response = await fetch('/api/event-map');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setEventData(data);
      } catch (err) {
        console.error('Event map data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEventData();
  }, []);

  const handlePrefectureClick = (prefecture) => {
    setSelectedPrefecture(selectedPrefecture?.name === prefecture.name ? null : prefecture);
  };

  // 都道府県を件数順にソート
  const sortedPrefectures = eventData?.prefectures?.sort((a, b) => b.count - a.count) || [];

  // 構造化データ
  const eventMapSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '佐藤拓也さん 都道府県別イベント開催統計',
    description: '声優・佐藤拓也さんのイベントが開催された都道府県別の統計データ',
    numberOfItems: sortedPrefectures.length,
    itemListElement: sortedPrefectures.map((prefecture, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Place',
        name: prefecture.name,
        description: `${prefecture.name}でのイベント開催数: ${prefecture.count}件`
      }
    }))
  };

  return (
    <Layout>
      <SEO 
        title="都道府県別イベント開催統計 | 佐藤拓也さん非公式ファンサイト"
        description="声優・佐藤拓也さんのイベントが開催された都道府県別の開催件数統計。全国のイベント開催傾向をご覧いただけます。"
        type="article"
      />
      {sortedPrefectures.length > 0 && (
        <SchemaOrg
          type="Place"
          data={eventMapSchema}
        />
      )}

      <section className="event-map-page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">EVENT MAP</h1>
            <p className="section-subtitle">都道府県別イベント統計</p>
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
            <>
              {/* 統計情報カード */}
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-value">{eventData?.prefectures?.length || 0}</div>
                  <div className="stat-label">開催都道府県数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{eventData?.totalEvents || 0}</div>
                  <div className="stat-label">総イベント数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.round((eventData?.totalEvents || 0) / (eventData?.prefectures?.length || 1))}
                  </div>
                  <div className="stat-label">平均開催数</div>
                </div>
              </div>

              {/* 都道府県別ランキング */}
              <div className="ranking-container">
                <h2 className="ranking-title">都道府県別開催件数ランキング</h2>
                <div className="prefecture-list">
                  {sortedPrefectures.map((prefecture, index) => (
                    <div
                      key={prefecture.name}
                      className={`prefecture-item ${selectedPrefecture?.name === prefecture.name ? 'active' : ''}`}
                      onClick={() => handlePrefectureClick(prefecture)}
                    >
                      <div className="prefecture-header">
                        <div className="prefecture-info">
                          <span className="prefecture-rank">#{index + 1}</span>
                          <h3 className="prefecture-name">{prefecture.name}</h3>
                        </div>
                        <div className="prefecture-count">
                          <span className="count-number">{prefecture.count}</span>
                          <span className="count-unit">件</span>
                          <span className="expand-icon">
                            {selectedPrefecture?.name === prefecture.name ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                      
                      {selectedPrefecture?.name === prefecture.name && (
                        <div className="prefecture-details">
                          <h4 className="details-title">最近のイベント</h4>
                          <div className="event-list">
                            {prefecture.events.slice(0, 5).map((event) => (
                              <div key={event.id} className="event-item">
                                <div className="event-info">
                                  <div className="event-title">{event.title}</div>
                                  <div className="event-location">{event.location}</div>
                                </div>
                                <div className="event-meta">
                                  <div className="event-date">
                                    {new Date(event.date).toLocaleDateString('ja-JP')}
                                  </div>
                                  <div className="event-category">{event.category}</div>
                                </div>
                              </div>
                            ))}
                            {prefecture.totalEvents > 5 && (
                              <div className="more-events">
                                他 {prefecture.totalEvents - 5} 件のイベント
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {sortedPrefectures.length === 0 && (
                <div className="no-data">イベントデータが見つかりませんでした。</div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}