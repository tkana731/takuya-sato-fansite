// components/EventMap/JapanMap.js
import { useState } from 'react';

export default function JapanMap({ eventData, onPrefectureClick, selectedPrefecture }) {
  const [hoveredPrefecture, setHoveredPrefecture] = useState(null);

  // 都道府県別のイベント数を取得
  const getPrefectureEventCount = (prefectureName) => {
    const prefecture = eventData?.prefectures?.find(p => p.name === prefectureName);
    return prefecture?.count || 0;
  };

  // イベント数に基づく色の濃さを計算
  const getPrefectureColor = (prefectureName) => {
    const count = getPrefectureEventCount(prefectureName);
    if (count === 0) return '#f0f0f0';
    if (count <= 2) return '#e3f2fd';
    if (count <= 5) return '#bbdefb';
    if (count <= 10) return '#90caf9';
    if (count <= 20) return '#64b5f6';
    return '#2196f3';
  };

  // 都道府県クリック処理
  const handlePrefectureClick = (prefectureName) => {
    const prefecture = eventData?.prefectures?.find(p => p.name === prefectureName);
    if (prefecture && prefecture.count > 0) {
      onPrefectureClick(prefecture);
    }
  };

  // 簡単な日本地図のSVG（主要都道府県のみ）
  return (
    <div className="japan-map">
      <svg viewBox="0 0 800 600" className="map-svg">
        {/* 北海道 */}
        <path
          d="M200 80 L280 70 L300 120 L250 140 L180 130 Z"
          fill={getPrefectureColor('北海道')}
          stroke="#fff"
          strokeWidth="1"
          className={`prefecture ${selectedPrefecture?.name === '北海道' ? 'selected' : ''}`}
          onClick={() => handlePrefectureClick('北海道')}
          onMouseEnter={() => setHoveredPrefecture('北海道')}
          onMouseLeave={() => setHoveredPrefecture(null)}
        />
        
        {/* 東京都 */}
        <circle
          cx="450"
          cy="280"
          r="15"
          fill={getPrefectureColor('東京都')}
          stroke="#fff"
          strokeWidth="1"
          className={`prefecture ${selectedPrefecture?.name === '東京都' ? 'selected' : ''}`}
          onClick={() => handlePrefectureClick('東京都')}
          onMouseEnter={() => setHoveredPrefecture('東京都')}
          onMouseLeave={() => setHoveredPrefecture(null)}
        />

        {/* 大阪府 */}
        <circle
          cx="380"
          cy="320"
          r="12"
          fill={getPrefectureColor('大阪府')}
          stroke="#fff"
          strokeWidth="1"
          className={`prefecture ${selectedPrefecture?.name === '大阪府' ? 'selected' : ''}`}
          onClick={() => handlePrefectureClick('大阪府')}
          onMouseEnter={() => setHoveredPrefecture('大阪府')}
          onMouseLeave={() => setHoveredPrefecture(null)}
        />

        {/* 愛知県 */}
        <circle
          cx="420"
          cy="290"
          r="10"
          fill={getPrefectureColor('愛知県')}
          stroke="#fff"
          strokeWidth="1"
          className={`prefecture ${selectedPrefecture?.name === '愛知県' ? 'selected' : ''}`}
          onClick={() => handlePrefectureClick('愛知県')}
          onMouseEnter={() => setHoveredPrefecture('愛知県')}
          onMouseLeave={() => setHoveredPrefecture(null)}
        />

        {/* 福岡県 */}
        <circle
          cx="280"
          cy="400"
          r="10"
          fill={getPrefectureColor('福岡県')}
          stroke="#fff"
          strokeWidth="1"
          className={`prefecture ${selectedPrefecture?.name === '福岡県' ? 'selected' : ''}`}
          onClick={() => handlePrefectureClick('福岡県')}
          onMouseEnter={() => setHoveredPrefecture('福岡県')}
          onMouseLeave={() => setHoveredPrefecture(null)}
        />
      </svg>

      {/* ホバー時の情報表示 */}
      {hoveredPrefecture && (
        <div className="prefecture-tooltip">
          <strong>{hoveredPrefecture}</strong>
          <br />
          イベント数: {getPrefectureEventCount(hoveredPrefecture)}件
        </div>
      )}

      {/* 凡例 */}
      <div className="map-legend">
        <h4>イベント開催数</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f0f0f0' }}></div>
            <span>0件</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#e3f2fd' }}></div>
            <span>1-2件</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#bbdefb' }}></div>
            <span>3-5件</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#90caf9' }}></div>
            <span>6-10件</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#64b5f6' }}></div>
            <span>11-20件</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#2196f3' }}></div>
            <span>21件以上</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .japan-map {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .map-svg {
          width: 100%;
          height: auto;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .prefecture {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .prefecture:hover {
          stroke: #1976d2;
          stroke-width: 2;
          filter: brightness(1.1);
        }

        .prefecture.selected {
          stroke: #1976d2;
          stroke-width: 3;
        }

        .prefecture-tooltip {
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          pointer-events: none;
          z-index: 10;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .map-legend {
          margin-top: 20px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .map-legend h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #333;
        }

        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          border: 1px solid #ddd;
        }

        @media (max-width: 768px) {
          .legend-items {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}