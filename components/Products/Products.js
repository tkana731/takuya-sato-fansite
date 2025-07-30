// components/Products/Products.js
import Link from 'next/link';
import { FaExternalLinkAlt, FaAmazon, FaYahoo, FaShoppingCart } from 'react-icons/fa';

const Products = ({ products }) => {
  // productsが配列でない場合は表示しない
  if (!products || !Array.isArray(products)) {
    return null;
  }

  // 商品データが空の場合は準備中メッセージを表示
  if (products.length === 0) {
    return (
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="highlight">NEW PRODUCTS</span>
              <span className="subtitle">発売予定商品</span>
            </h2>
          </div>
          <div className="products-empty">
            <p>商品情報を準備中です。しばらくお待ちください。</p>
          </div>
        </div>
      </section>
    );
  }

  // アフィリエイトプラットフォームアイコンの取得
  const getPlatformIcon = (code) => {
    switch (code) {
      case 'amazon':
        return <FaAmazon />;
      case 'rakuten':
        return <FaYahoo />;
      default:
        return <FaShoppingCart />;
    }
  };


  // 日付の表示フォーマット
  const formatDate = (dateString, displayString) => {
    if (displayString) return displayString;
    if (!dateString) return '発売日未定';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  };

  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span className="highlight">NEW PRODUCTS</span>
            <span className="subtitle">発売予定商品</span>
          </h2>
        </div>

        <div className="products-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <div className="product-category">
                  <span className="category-badge">{product.category.name}</span>
                  {product.isPreorder && (
                    <span className="preorder-badge">予約受付中</span>
                  )}
                </div>
              </div>

              <h3 className="product-title">{product.title}</h3>
              
              {/* 発売日を商品名のすぐ下に表示 */}
              <div className="product-release-date">
                {formatDate(product.releaseDate, product.releaseDateDisplay)}
              </div>

              {/* 複数バリエーションの表示（コンパクト版） */}
              {product.variants && product.variants.length > 0 && (
                <div className="product-variants-compact">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="variant-compact">
                      <div className="variant-info">
                        <span className="variant-name">{variant.name}</span>
                        {variant.price && (
                          <span className="variant-price">¥{variant.price.toLocaleString()}</span>
                        )}
                        {variant.productCode && (
                          <span className="variant-code">({variant.productCode})</span>
                        )}
                      </div>
                      
                      <div className="variant-actions">
                        {variant.officialUrl && (
                          <a
                            href={variant.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="official-link-compact"
                            title="公式サイト"
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                        
                        {variant.affiliateLinks && variant.affiliateLinks.map((link) => (
                          <a
                            key={link.code}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`affiliate-link-compact ${link.code}`}
                            title={`${link.platform}で購入`}
                          >
                            {getPlatformIcon(link.code)}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 単一商品の場合のフォールバック */}
              {(!product.variants || product.variants.length === 0) && (
                <>
                  {product.productCode && (
                    <div className="product-code">品番: {product.productCode}</div>
                  )}
                  
                  <div className="product-links">
                    {product.officialUrl && (
                      <a
                        href={product.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="official-link product-link-button"
                        title="公式サイト"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                    
                    {product.affiliateLinks && product.affiliateLinks.map((link) => (
                      <a
                        key={link.code}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`affiliate-link product-link-button ${link.code}`}
                        title={`${link.platform}で購入`}
                      >
                        {getPlatformIcon(link.code)}
                      </a>
                    ))}
                  </div>
                </>
              )}

              {product.relatedWorks && product.relatedWorks.length > 0 && (
                <div className="product-related">
                  {product.relatedWorks.map((work, index) => (
                    <span key={work.id} className="related-work">
                      {work.title}
                      {work.description && ` (${work.description})`}
                      {index < product.relatedWorks.length - 1 && '、'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="section-footer">
          <Link href="/products">
            <a className="view-all-button">
              すべての商品を見る
              <span className="arrow">→</span>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Products;