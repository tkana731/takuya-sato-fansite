import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';

export default function EventMapPage() {
  const [eventData, setEventData] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'stats'

  useEffect(() => {
    async function fetchEventData() {
      try {
        const response = await fetch('/api/event-map');
        if (!response.ok) {
          throw new Error('データの取得に失敗しました');
        }
        const data = await response.json();
        setEventData(data);
        // 初期表示時は現在年のイベントのみ表示
        const currentYear = new Date().getFullYear();
        const currentYearEvents = (data.allEvents || []).filter(event => event.year === currentYear);
        setFilteredEvents(currentYearEvents);
      } catch (err) {
        console.error('Event map data fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEventData();
  }, []);

  // フィルタリング処理
  useEffect(() => {
    if (!eventData || !eventData.allEvents) return;

    let filtered = [...eventData.allEvents];

    // 年でフィルタリング
    if (selectedYear !== 'all') {
      filtered = filtered.filter(event => event.year === parseInt(selectedYear));
    }

    // 都道府県でフィルタリング
    if (selectedPrefecture !== 'all') {
      filtered = filtered.filter(event => event.prefecture === selectedPrefecture);
    }

    setFilteredEvents(filtered);
  }, [selectedYear, selectedPrefecture, eventData]);

  // 構造化データ
  const eventMapSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '佐藤拓也さん イベント一覧',
    description: '声優・佐藤拓也さんのイベント一覧と開催統計データ',
    numberOfItems: filteredEvents.length,
    itemListElement: filteredEvents.slice(0, 10).map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.title,
        location: {
          '@type': 'Place',
          name: event.location,
          address: {
            '@type': 'PostalAddress',
            addressRegion: event.prefecture
          }
        },
        startDate: event.date
      }
    }))
  };

  return (
    <Layout>
      <SEO 
        title="イベント一覧・開催統計 | 佐藤拓也さん非公式ファンサイト"
        description="声優・佐藤拓也さんのイベント一覧と都道府県別の開催統計。年別・地域別に絞り込んで検索できます。"
        type="article"
      />
      {filteredEvents.length > 0 && (
        <SchemaOrg
          type="Event"
          data={eventMapSchema}
        />
      )}

      <section className="event-map-page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">EVENT MAP</h1>
            <p className="section-subtitle">イベント一覧・開催統計</p>
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
              {/* 表示モード切り替え */}
              <div className="view-mode-toggle">
                <button 
                  className={`mode-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <span className="mode-icon">📋</span>
                  イベント一覧
                </button>
                <button 
                  className={`mode-button ${viewMode === 'stats' ? 'active' : ''}`}
                  onClick={() => setViewMode('stats')}
                >
                  <span className="mode-icon">📊</span>
                  統計データ
                </button>
              </div>

              {/* フィルター */}
              <div className="filters-container">
                <div className="filter-group">
                  <label className="filter-label">年度：</label>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">全期間</option>
                    {eventData?.availableYears?.map(year => (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">都道府県：</label>
                  <select 
                    value={selectedPrefecture} 
                    onChange={(e) => setSelectedPrefecture(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">全都道府県</option>
                    {eventData?.prefectures
                      ?.filter(p => p.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .map(prefecture => (
                        <option key={prefecture.name} value={prefecture.name}>
                          {prefecture.name} ({prefecture.count}件)
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="filter-result">
                  <span className="result-count">{filteredEvents.length}</span>件のイベント
                </div>
              </div>

              {viewMode === 'list' ? (
                /* イベント一覧表示 */
                <div className="events-list-container">
                  {filteredEvents.length > 0 ? (
                    <div className="events-list">
                      {filteredEvents.map((event) => (
                        <div key={`${event.id}-${event.date}`} className="event-card">
                          <div className="event-date-badge">
                            <div className="event-year">{new Date(event.date).getFullYear()}</div>
                            <div className="event-month-day">
                              {(() => {
                                const date = new Date(event.date);
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                return `${month}/${day}`;
                              })()}
                            </div>
                            <div className="event-weekday">
                              {(() => {
                                const date = new Date(event.date);
                                const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                                return weekdays[date.getDay()];
                              })()}
                            </div>
                          </div>
                          <div className="event-content">
                            <h3 className="event-title">{event.title}</h3>
                            <div className="event-details">
                              <div className="event-detail-item">
                                <span className="detail-icon">📍</span>
                                <span>{event.location}</span>
                              </div>
                              <div className="event-detail-item">
                                <span className="detail-icon">🗾</span>
                                <span>{event.prefecture}</span>
                              </div>
                              {event.category && (
                                <div className="event-detail-item">
                                  <span className="detail-icon">🏷️</span>
                                  <span className="event-category-badge">{event.category}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-events">
                      <p>該当するイベントが見つかりませんでした。</p>
                    </div>
                  )}
                </div>
              ) : (
                /* 統計データ表示 */
                <div className="stats-view-container">
                  {/* 統計サマリー */}
                  <div className="stats-summary">
                    <div className="stat-card">
                      <div className="stat-value">
                        {selectedYear === 'all' 
                          ? eventData?.prefectures?.filter(p => p.count > 0).length
                          : eventData?.prefectures?.filter(p => p.yearlyBreakdown?.[selectedYear] > 0).length
                        }
                      </div>
                      <div className="stat-label">開催都道府県数</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {filteredEvents.length}
                      </div>
                      <div className="stat-label">総イベント数</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">
                        {(() => {
                          if (selectedYear === 'all') {
                            return '-';
                          }
                          const currentYear = parseInt(selectedYear);
                          const previousYear = (currentYear - 1).toString();
                          const currentCount = eventData?.yearlyData?.[selectedYear] || 0;
                          const previousCount = eventData?.yearlyData?.[previousYear] || 0;
                          const change = currentCount - previousCount;
                          
                          if (!eventData?.yearlyData?.[previousYear]) {
                            return '-';
                          }
                          
                          return `${change >= 0 ? '+' : ''}${change}`;
                        })()}
                      </div>
                      <div className="stat-label">
                        総イベント数<br/>前年比
                      </div>
                    </div>
                  </div>

                  {/* 都道府県ランキング */}
                  <div className="prefecture-ranking">
                    <h2 className="ranking-title">都道府県別開催件数</h2>
                    <div className="ranking-list">
                      {(() => {
                        const rankedPrefectures = selectedYear === 'all'
                          ? eventData?.prefectures?.sort((a, b) => b.count - a.count)
                          : eventData?.prefectures
                              ?.map(p => ({
                                ...p,
                                yearCount: p.yearlyBreakdown?.[selectedYear] || 0
                              }))
                              .sort((a, b) => b.yearCount - a.yearCount);
                        
                        return rankedPrefectures
                          ?.filter(p => selectedYear === 'all' ? p.count > 0 : p.yearCount > 0)
                          .map((prefecture, index) => (
                            <div key={prefecture.name} className="ranking-item">
                              <div className="rank-number">#{index + 1}</div>
                              <div className="prefecture-name">{prefecture.name}</div>
                              <div className="event-count">
                                {selectedYear === 'all' ? prefecture.count : prefecture.yearCount}件
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}