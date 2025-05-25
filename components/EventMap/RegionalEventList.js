// components/EventMap/RegionalEventList.js
export default function RegionalEventList({ prefecture, onClose }) {
  if (!prefecture) return null;

  // 日付のフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  };

  // カテゴリーの表示名マッピング
  const getCategoryName = (category) => {
    const categoryMap = {
      'event': 'イベント',
      'stage': '舞台・朗読',
      'broadcast': '生放送',
      'other': 'その他'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="regional-event-list">
      <div className="event-list-header">
        <h3>{prefecture.name} のイベント</h3>
        <button onClick={onClose} className="close-button" aria-label="閉じる">
          ×
        </button>
      </div>

      <div className="event-count">
        <span className="count-number">{prefecture.count}</span>
        <span className="count-label">件のイベント</span>
      </div>

      <div className="event-list">
        {prefecture.events.length > 0 ? (
          <ul className="events">
            {prefecture.events.map((event, index) => {
              const date = formatDate(event.date);
              return (
                <li key={index} className="event-item">
                  <div className="event-date">
                    <span className="date-year">{date.year}</span>
                    <span className="date-month">{date.month}</span>
                    <span className="date-day">{date.day}</span>
                  </div>
                  <div className="event-content">
                    <span className={`event-category category-${event.category}`}>
                      {getCategoryName(event.category)}
                    </span>
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-location">{event.location}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="no-events">イベント情報がありません。</p>
        )}
      </div>

      <style jsx>{`
        .regional-event-list {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          overflow: hidden;
        }

        .event-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2196f3, #1976d2);
          color: white;
        }

        .event-list-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .event-count {
          padding: 16px 24px;
          text-align: center;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .count-number {
          font-size: 24px;
          font-weight: bold;
          color: #2196f3;
        }

        .count-label {
          font-size: 14px;
          color: #666;
          margin-left: 8px;
        }

        .event-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 0;
        }

        .events {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .event-item {
          display: flex;
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .event-item:hover {
          background-color: #f8f9fa;
        }

        .event-item:last-child {
          border-bottom: none;
        }

        .event-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 16px;
          min-width: 60px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 8px;
        }

        .date-year {
          font-size: 10px;
          color: #666;
          line-height: 1;
        }

        .date-month {
          font-size: 14px;
          font-weight: bold;
          color: #2196f3;
          line-height: 1;
        }

        .date-day {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          line-height: 1;
        }

        .event-content {
          flex: 1;
        }

        .event-category {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .category-event { background: #e3f2fd; color: #1976d2; }
        .category-stage { background: #f3e5f5; color: #7b1fa2; }
        .category-broadcast { background: #e8f5e8; color: #388e3c; }

        .event-title {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          line-height: 1.3;
        }

        .event-location {
          margin: 0;
          font-size: 12px;
          color: #666;
          line-height: 1.3;
        }

        .no-events {
          padding: 40px 24px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .regional-event-list {
            width: 95%;
            max-height: 85vh;
          }

          .event-list-header {
            padding: 16px 20px;
          }

          .event-count {
            padding: 12px 20px;
          }

          .event-item {
            padding: 12px 20px;
          }

          .event-date {
            min-width: 50px;
            margin-right: 12px;
            padding: 6px;
          }
        }
      `}</style>
    </div>
  );
}