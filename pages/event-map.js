import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';
import ScheduleCard from '../components/ScheduleCard/ScheduleCard';

export default function EventMapPage({ eventData }) {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedPerformer, setSelectedPerformer] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'stats'

  // 初期化時に現在年のイベントを設定
  useEffect(() => {
    if (eventData && eventData.allEvents) {
      const currentYear = new Date().getFullYear();
      const currentYearEvents = (eventData.allEvents || []).filter(event => event.year === currentYear);
      setFilteredEvents(currentYearEvents);
    }
  }, [eventData]);

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

    // 出演者でフィルタリング
    if (selectedPerformer !== 'all') {
      filtered = filtered.filter(event => {
        // イベントデータから出演者情報を取得して絞り込み
        // API側で出演者情報を含める必要がある
        return event.performers && event.performers.some(performer => 
          performer.name === selectedPerformer
        );
      });
    }

    setFilteredEvents(filtered);
  }, [selectedYear, selectedPrefecture, selectedPerformer, eventData]);

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
        description: event.description || `佐藤拓也さん出演イベント`,
        startDate: event.date,
        endDate: event.date,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: event.location,
          address: {
            '@type': 'PostalAddress',
            addressRegion: event.prefecture
          }
        },
        performer: {
          '@type': 'Person',
          name: '佐藤拓也'
        },
        organizer: {
          '@type': 'Organization',
          name: event.organizer || '主催者'
        },
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: event.price || '0',
          priceCurrency: 'JPY',
          url: event.link || null
        },
        image: event.image || 'https://takuya-sato-fansite.com/takuya-sato-default.jpg',
        url: event.link || null
      }
    }))
  };

  return (
    <Layout>
      <SEO 
        title="イベントマップ | 佐藤拓也さん非公式ファンサイト"
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

          <>
              {/* 表示モード切り替え - 楽曲一覧と同じタブ構造 */}
              <div className="works-tabs">
                <div className="works-tabs-container">
                  <button
                    className={`works-tab ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    イベント一覧
                  </button>
                  <button
                    className={`works-tab ${viewMode === 'stats' ? 'active' : ''}`}
                    onClick={() => setViewMode('stats')}
                  >
                    統計データ
                  </button>
                </div>
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
                    {(() => {
                      // 都道府県コード順序の定義（01北海道〜47沖縄県）
                      const prefectureOrder = [
                        '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
                        '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
                        '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
                        '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
                        '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
                        '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
                        '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
                      ];
                      
                      return eventData?.prefectures
                        ?.filter(p => p.count > 0)
                        .sort((a, b) => prefectureOrder.indexOf(a.name) - prefectureOrder.indexOf(b.name))
                        .map(prefecture => (
                          <option key={prefecture.name} value={prefecture.name}>
                            {prefecture.name}
                          </option>
                        ));
                    })()}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">出演者：</label>
                  <select 
                    value={selectedPerformer} 
                    onChange={(e) => setSelectedPerformer(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">全出演者</option>
                    {eventData?.performerStats
                      ?.sort((a, b) => b.count - a.count)
                      .map(performer => (
                        <option key={performer.name} value={performer.name}>
                          {performer.name}
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
                    <ul className="schedule-items">
                      {filteredEvents.map((event) => {
                        // イベントデータをスケジュールカード形式に変換
                        const scheduleData = {
                          id: event.id,
                          title: event.title,
                          date: event.date,
                          location: event.location,
                          prefecture: event.prefecture,
                          categoryName: event.category,
                          categoryColor: event.categoryColor || 'var(--primary-color)',
                          locationType: '会場開催',
                          time: event.time,
                          isAllDay: event.isAllDay,
                          link: event.link || null,
                          description: event.description || null,
                          performers: event.performers || [],
                          isLongTerm: false
                        };
                        
                        return (
                          <ScheduleCard 
                            key={`${event.id}-${event.date}`}
                            schedule={scheduleData}
                            showLink={!!event.link}
                            showCalendarButton={true}
                            linkPath={null}
                          />
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="no-schedule">
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
                        {selectedPrefecture !== 'all' || selectedPerformer !== 'all' ? '-' : (
                          selectedYear === 'all' 
                            ? eventData?.prefectures?.filter(p => p.count > 0).length
                            : eventData?.prefectures?.filter(p => p.yearlyBreakdown?.[selectedYear] > 0).length
                        )}
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
                          
                          // 絞り込み条件に基づいて前年比を計算
                          let currentCount = 0;
                          let previousCount = 0;
                          
                          if (selectedPrefecture === 'all' && selectedPerformer === 'all') {
                            // 全都道府県・全出演者の場合：年別総データを使用
                            currentCount = eventData?.yearlyData?.[selectedYear] || 0;
                            previousCount = eventData?.yearlyData?.[previousYear] || 0;
                          } else {
                            // 絞り込み条件がある場合：実際のフィルタリング結果から計算
                            const allEvents = eventData?.allEvents || [];
                            
                            // 当年の絞り込み件数
                            let currentYearEvents = allEvents.filter(event => event.year === parseInt(selectedYear));
                            if (selectedPrefecture !== 'all') {
                              currentYearEvents = currentYearEvents.filter(event => event.prefecture === selectedPrefecture);
                            }
                            if (selectedPerformer !== 'all') {
                              currentYearEvents = currentYearEvents.filter(event => 
                                event.performers && event.performers.some(performer => performer.name === selectedPerformer)
                              );
                            }
                            currentCount = currentYearEvents.length;
                            
                            // 前年の絞り込み件数
                            let previousYearEvents = allEvents.filter(event => event.year === parseInt(previousYear));
                            if (selectedPrefecture !== 'all') {
                              previousYearEvents = previousYearEvents.filter(event => event.prefecture === selectedPrefecture);
                            }
                            if (selectedPerformer !== 'all') {
                              previousYearEvents = previousYearEvents.filter(event => 
                                event.performers && event.performers.some(performer => performer.name === selectedPerformer)
                              );
                            }
                            previousCount = previousYearEvents.length;
                          }
                          
                          const change = currentCount - previousCount;
                          
                          // 前年データがない場合は'-'を表示
                          if (previousCount === 0 && currentCount === 0) {
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
                        let rankedPrefectures;
                        
                        // 年度による絞り込み
                        if (selectedYear === 'all') {
                          rankedPrefectures = eventData?.prefectures?.map(p => ({
                            ...p,
                            displayCount: p.count
                          }));
                        } else {
                          rankedPrefectures = eventData?.prefectures?.map(p => ({
                            ...p,
                            displayCount: p.yearlyBreakdown?.[selectedYear] || 0
                          }));
                        }
                        
                        // 都道府県による絞り込み
                        if (selectedPrefecture !== 'all') {
                          rankedPrefectures = rankedPrefectures?.filter(p => p.name === selectedPrefecture);
                        }
                        
                        // 出演者による絞り込み
                        if (selectedPerformer !== 'all') {
                          // 年度・出演者の複合フィルタ用に filteredEvents を使用
                          rankedPrefectures = eventData?.prefectures?.map(p => ({
                            ...p,
                            displayCount: filteredEvents.filter(e => e.prefecture === p.name).length
                          })).filter(p => p.displayCount > 0);
                        }
                        
                        // 件数でソートして0件は除外
                        return rankedPrefectures
                          ?.filter(p => p.displayCount > 0)
                          .sort((a, b) => b.displayCount - a.displayCount)
                          .map((prefecture, index) => (
                            <div key={prefecture.name} className="ranking-item">
                              <div className="rank-number">#{index + 1}</div>
                              <div 
                                className="prefecture-name clickable"
                                onClick={() => {
                                  setSelectedPrefecture(prefecture.name);
                                  setViewMode('list');
                                }}
                              >
                                {prefecture.name}
                              </div>
                              <div className="event-count">
                                {prefecture.displayCount}件
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>

                  {/* 共演者統計 */}
                  <div className="performer-stats">
                    <h2 className="stats-title">共演の多い出演者</h2>
                    <div className="performer-stats-list">
                      {(() => {
                        let performers = eventData?.performerStats || [];
                        
                        // 年度による絞り込み
                        if (selectedYear !== 'all') {
                          performers = performers.map(p => ({
                            ...p,
                            displayCount: p.yearlyBreakdown?.[selectedYear] || 0
                          })).filter(p => p.displayCount > 0);
                        } else {
                          performers = performers.map(p => ({
                            ...p,
                            displayCount: p.count
                          })).filter(p => p.displayCount > 0);
                        }
                        
                        // 都道府県による絞り込み
                        if (selectedPrefecture !== 'all') {
                          performers = performers.map(p => ({
                            ...p,
                            displayCount: p.events.filter(e => e.prefecture === selectedPrefecture).length
                          })).filter(p => p.displayCount > 0);
                        }
                        
                        // 選択された出演者がいる場合は、filteredEventsに基づいて共演回数を再計算
                        if (selectedPerformer !== 'all') {
                          // フィルタリングされたイベントでの実際の共演回数を計算
                          const selectedPerformerData = performers.find(p => p.name === selectedPerformer);
                          if (selectedPerformerData) {
                            // filteredEventsからその出演者が出演するイベント数をカウント
                            const actualCount = filteredEvents.filter(event => 
                              event.performers && event.performers.some(performer => 
                                performer.name === selectedPerformer
                              )
                            ).length;
                            
                            performers = [{
                              ...selectedPerformerData,
                              displayCount: actualCount
                            }];
                          } else {
                            performers = [];
                          }
                        }
                        
                        return performers
                          .sort((a, b) => b.displayCount - a.displayCount)
                          .slice(0, 10) // 上位10名まで表示
                          .map((performer, index) => (
                            <div key={performer.name} className="performer-stats-item">
                              <div className="performer-rank">#{index + 1}</div>
                              <div 
                                className="performer-name clickable"
                                onClick={() => {
                                  setSelectedPerformer(performer.name);
                                  setViewMode('list');
                                }}
                              >
                                {performer.name}
                              </div>
                              <div className="performer-count">{performer.displayCount}回共演</div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                </div>
              )}
          </>
        </div>
      </section>
    </Layout>
  );
}

// SSG (Static Site Generation) の実装
export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/event-map`);
    
    if (!response.ok) {
      throw new Error('Event map data fetch failed');
    }
    
    const eventData = await response.json();
    
    return {
      props: {
        eventData
      },
      revalidate: 3600 // 1時間ごとに再生成
    };
  } catch (error) {
    console.error('Static props generation error:', error);
    
    // エラー時のフォールバック
    return {
      props: {
        eventData: {
          allEvents: [],
          prefectures: [],
          availableYears: [],
          yearlyData: {}
        }
      },
      revalidate: 300 // エラー時は5分後に再試行
    };
  }
}