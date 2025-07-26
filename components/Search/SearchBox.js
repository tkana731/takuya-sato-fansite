import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function SearchBox({ onClose, isHeaderSearch = false }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    
    // 検索ページに遷移
    await router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    
    setIsLoading(false);
    
    // ヘッダー検索の場合は閉じる
    if (onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  return (
    <div className={`search-box ${isHeaderSearch ? 'header-search' : ''}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="出演作品、スケジュール、キャラクター等を検索..."
            className="search-input"
            disabled={isLoading}
            autoFocus={!isHeaderSearch}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="clear-button"
              aria-label="検索語をクリア"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="search-submit"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? '検索中...' : '検索'}
        </button>
      </form>
      
      {isHeaderSearch && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="close-search"
          aria-label="検索を閉じる"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}