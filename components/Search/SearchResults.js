import Link from 'next/link';
import { FaFilm, FaCalendarAlt, FaUser, FaMusic, FaShoppingCart } from 'react-icons/fa';

const typeIcons = {
  work: FaFilm,
  schedule: FaCalendarAlt,
  character: FaUser,
  song: FaMusic,
  product: FaShoppingCart
};

const typeLabels = {
  work: '出演作品',
  schedule: 'スケジュール',
  character: 'キャラクター',
  song: '楽曲',
  product: '商品'
};

export default function SearchResults({ results, query, stats }) {
  if (!results || results.length === 0) {
    return (
      <div className="search-no-results">
        <h3>検索結果が見つかりませんでした</h3>
        <p>「{query}」に一致する結果はありませんでした。</p>
        <div className="search-suggestions">
          <h4>検索のヒント：</h4>
          <ul>
            <li>キーワードのスペルを確認してください</li>
            <li>別のキーワードを試してください</li>
            <li>一般的な単語（作品名、キャラクター名など）で検索してください</li>
          </ul>
        </div>
      </div>
    );
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {});

  return (
    <div className="search-results">
      <div className="search-stats">
        <h3>「{query}」の検索結果: {results.length}件</h3>
        <div className="search-stats-breakdown">
          {Object.entries(stats.byType).map(([type, count]) => (
            count > 0 && (
              <span key={type} className="stats-item">
                {typeLabels[type]}: {count}件
              </span>
            )
          ))}
        </div>
      </div>

      {Object.entries(groupedResults).map(([type, items]) => {
        const Icon = typeIcons[type];
        return (
          <div key={type} className="search-group">
            <h4 className="search-group-title">
              <Icon className="group-icon" />
              {typeLabels[type]}（{items.length}件）
            </h4>
            <div className="search-items">
              {items.map((item, index) => (
                <SearchResultItem key={`${type}-${index}`} item={item} query={query} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SearchResultItem({ item, query }) {
  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span className="search-text">
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="search-highlight">{part}</mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="search-result-item">
      <div className="result-header">
        <h5 className="result-title">
          <Link href={item.url} className="result-link">
            {highlightText(item.title, query)}
          </Link>
        </h5>
      </div>
      
      <div className="result-details">
        {item.role && (
          <p className="result-role">
            役: {highlightText(item.role, query)}
          </p>
        )}
        {item.artist && (
          <p className="result-artist">
            アーティスト: {highlightText(item.artist, query)}
          </p>
        )}
        {item.work_title && (
          <p className="result-work">
            作品: {highlightText(item.work_title, query)}
          </p>
        )}
        {item.category && item.type === 'schedule' && (
          <span className="category-badge schedule-category" style={{ backgroundColor: item.categoryColor || 'var(--primary-color)' }}>
            {item.category}
          </span>
        )}
        {item.category && item.type !== 'schedule' && (
          <span className="result-category">{item.category}</span>
        )}
        {item.year && (
          <span className="result-year">{item.year}年</span>
        )}
        {item.start_date && item.type === 'schedule' && (
          <>
            <span className="result-date schedule-date">
              <FaCalendarAlt className="date-icon" />
              {formatDate(item.start_date)}
            </span>
            {item.performers && item.performers.length > 0 && (
              <div className="result-performers">
                出演: {item.performers.map((performer, index) => (
                  <span key={index} className="performer-name">
                    {highlightText(performer, query)}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        {item.start_date && item.type !== 'schedule' && (
          <span className="result-date">{formatDate(item.start_date)}</span>
        )}
        {item.birthday && (
          <span className="result-birthday">誕生日: {item.birthday}</span>
        )}
        {item.price && (
          <span className="result-price">¥{item.price.toLocaleString()}</span>
        )}
      </div>
      
      {item.description && item.type !== 'schedule' && (
        <p className="result-description">
          {highlightText(item.description, query)}
        </p>
      )}
    </div>
  );
}