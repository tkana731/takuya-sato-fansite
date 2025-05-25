// components/EventMap/EventMap.js
import { useState, useEffect } from 'react';

export default function EventMap() {
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

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <div className="audio-wave flex space-x-1 mb-4">
              <div className="w-2 h-8 bg-blue-600 rounded animate-pulse"></div>
              <div className="w-2 h-6 bg-blue-600 rounded animate-pulse delay-75"></div>
              <div className="w-2 h-10 bg-blue-600 rounded animate-pulse delay-150"></div>
              <div className="w-2 h-6 bg-blue-600 rounded animate-pulse delay-225"></div>
              <div className="w-2 h-8 bg-blue-600 rounded animate-pulse delay-300"></div>
            </div>
            <p className="text-lg font-medium text-gray-600">LOADING...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 都道府県を件数順にソート
  const sortedPrefectures = eventData?.prefectures?.sort((a, b) => b.count - a.count) || [];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">都道府県別イベント開催件数</h1>
          <p className="text-xl text-gray-600 mb-2">Prefecture Event Statistics</p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            佐藤拓也さんのイベントが開催された都道府県別の開催件数です。
            都道府県名をクリックすると詳細なイベント情報をご覧いただけます。
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {eventData?.prefectures?.length || 0}
            </div>
            <div className="text-gray-600">開催都道府県数</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {eventData?.totalEvents || 0}
            </div>
            <div className="text-gray-600">総イベント数</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round((eventData?.totalEvents || 0) / (eventData?.prefectures?.length || 1))}
            </div>
            <div className="text-gray-600">平均開催数/都道府県</div>
          </div>
        </div>

        {/* 都道府県別件数リスト */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">都道府県別開催件数ランキング</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {sortedPrefectures.map((prefecture, index) => (
              <div
                key={prefecture.name}
                className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedPrefecture?.name === prefecture.name ? 'bg-blue-50' : ''
                }`}
                onClick={() => handlePrefectureClick(prefecture)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{prefecture.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{prefecture.count}</div>
                      <div className="text-sm text-gray-500">件</div>
                    </div>
                    <div className="text-gray-400">
                      {selectedPrefecture?.name === prefecture.name ? '▲' : '▼'}
                    </div>
                  </div>
                </div>
                
                {selectedPrefecture?.name === prefecture.name && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">最近のイベント</h4>
                    <div className="space-y-2">
                      {prefecture.events.slice(0, 5).map((event) => (
                        <div key={event.id} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-gray-600">{event.location}</div>
                          </div>
                          <div className="flex-shrink-0 ml-4 text-right">
                            <div className="text-gray-500">{new Date(event.date).toLocaleDateString('ja-JP')}</div>
                            <div className="text-xs text-gray-400">{event.category}</div>
                          </div>
                        </div>
                      ))}
                      {prefecture.events.length > 5 && (
                        <div className="text-sm text-gray-500 text-center pt-2">
                          他 {prefecture.events.length - 5} 件のイベント
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
          <div className="text-center py-12">
            <p className="text-gray-500">イベントデータが見つかりませんでした。</p>
          </div>
        )}
      </div>
    </section>
  );
}