import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';
import { FaExternalLinkAlt, FaShoppingCart } from 'react-icons/fa';

export default function ProductsPage({ productData }) {
  const [activeTab, setActiveTab] = useState('all');

  // タブ切り替え処理
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // カテゴリの日本語表示
  const getCategoryLabel = (code) => {
    const categoryLabels = {
      'all': 'すべて',
      'cd': 'CD',
      'dvd': 'DVD',
      'blu-ray': 'Blu-ray',
      'photobook': 'フォトブック',
      'pamphlet': 'パンフレット',
      'magazine': '雑誌',
      'clear_card': 'クリアカード',
      'goods': 'グッズ'
    };
    return categoryLabels[code] || code;
  };

  // メタデータの生成
  const generateMetadata = () => {
    const currentTabName = getCategoryLabel(activeTab);
    const title = `佐藤拓也さん関連商品一覧 - ${currentTabName} | 佐藤拓也さん非公式ファンサイト`;
    const description = `声優・佐藤拓也さんの${currentTabName}商品を一覧で掲載。発売日、価格、購入リンクなどの詳細情報をまとめています。`;

    return { title, description };
  };

  // 構造化データの生成
  const generateSchemaData = () => {
    let currentProducts;
    if (activeTab === 'all') {
      // 全カテゴリのデータを統合
      const allSeries = [];
      const allStandalone = [];
      
      Object.keys(productData || {}).forEach(categoryCode => {
        if (categoryCode !== 'all') {
          const categoryData = productData[categoryCode] || { series: [], standalone: [] };
          allSeries.push(...(categoryData.series || []));
          allStandalone.push(...(categoryData.standalone || []));
        }
      });
      
      // シリーズ商品内の個別商品も発売日でソート
      const sortedSeries = allSeries.map(series => ({
        ...series,
        products: sortByReleaseDate([...series.products])
      }));
      
      // 単独商品を発売日でソート
      const sortedStandalone = sortByReleaseDate([...allStandalone]);
      
      currentProducts = { series: sortedSeries, standalone: sortedStandalone };
    } else {
      currentProducts = productData?.[activeTab] || { series: [], standalone: [] };
    }
    
    const allProducts = [
      ...currentProducts.standalone || [],
      ...(currentProducts.series?.flatMap(s => s.products) || [])
    ];

    if (allProducts.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `佐藤拓也さん関連商品一覧 - ${getCategoryLabel(activeTab)}`,
      description: generateMetadata().description,
      numberOfItems: allProducts.length,
      itemListElement: allProducts.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.title,
          description: product.description || `佐藤拓也さん関連の${getCategoryLabel(product.category?.code)}商品`,
          productID: product.productCode,
          releaseDate: product.releaseDate,
          offers: {
            '@type': 'Offer',
            availability: product.isPreorder ? 'PreOrder' : 'InStock',
            url: product.officialUrl
          }
        }
      }))
    };
  };


  // 日付のフォーマット
  const formatDate = (date, displayDate) => {
    if (displayDate) return displayDate;
    if (!date) return '発売日未定';
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // 発売日でソートする関数（降順）
  const sortByReleaseDate = (products) => {
    return products.sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date(0);
      const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date(0);
      return dateB - dateA; // 降順（新しい順）
    });
  };

  const { title: pageTitle, description: pageDescription } = generateMetadata();

  // タブのリスト
  const tabs = [
    { code: 'all', label: 'すべて' },
    { code: 'cd', label: 'CD' },
    { code: 'dvd', label: 'DVD' },
    { code: 'blu-ray', label: 'Blu-ray' },
    { code: 'photobook', label: 'フォトブック' },
    { code: 'pamphlet', label: 'パンフレット' },
    { code: 'magazine', label: '雑誌' },
    { code: 'clear_card', label: 'クリアカード' },
    { code: 'goods', label: 'グッズ' }
  ];

  return (
    <Layout>
      <SEO 
        title={pageTitle}
        description={pageDescription}
        type="article"
      />
      {generateSchemaData() && (
        <SchemaOrg
          type="Product"
          data={generateSchemaData()}
        />
      )}

      <section className="works-page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">PRODUCTS</h1>
            <p className="section-subtitle">関連商品一覧</p>
          </div>

          {/* カテゴリ選択プルダウン */}
          <div className="category-select-container">
            <div className="filter-group">
              <label htmlFor="category-select" className="category-select-label">
                カテゴリ：
              </label>
              <select
                id="category-select"
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="category-select"
              >
                {tabs.map(tab => (
                  <option key={tab.code} value={tab.code}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 各タブのコンテンツ */}
          {tabs.map(tab => {
            // 「すべて」の場合は全カテゴリのデータを統合
            let tabData;
            if (tab.code === 'all') {
              // 全カテゴリのデータを統合
              const allSeries = [];
              const allStandalone = [];
              
              Object.keys(productData || {}).forEach(categoryCode => {
                if (categoryCode !== 'all') {
                  const categoryData = productData[categoryCode] || { series: [], standalone: [] };
                  allSeries.push(...(categoryData.series || []));
                  allStandalone.push(...(categoryData.standalone || []));
                }
              });
              
              // シリーズ商品内の個別商品も発売日でソート
              const sortedSeries = allSeries.map(series => ({
                ...series,
                products: sortByReleaseDate([...series.products])
              }));
              
              // 単独商品を発売日でソート
              const sortedStandalone = sortByReleaseDate([...allStandalone]);
              
              tabData = { series: sortedSeries, standalone: sortedStandalone };
            } else {
              tabData = productData?.[tab.code] || { series: [], standalone: [] };
            }
            
            return (
              <div 
                key={tab.code}
                id={`${tab.code}-content`} 
                className={`works-content ${activeTab === tab.code ? 'active' : ''}`}
                role="tabpanel"
                aria-labelledby={`${tab.code}-tab`}
              >
                <div className="works-list">
                <h3 className="list-title">
                  {tab.code === 'all' ? '全商品一覧' : `${getCategoryLabel(tab.code)}商品一覧`}
                </h3>
                <ul className="list-items">
                  {/* シリーズ商品を統一リストに統合 */}
                  {tabData.series && tabData.series.length > 0 && 
                    tabData.series.map(series => 
                      series.products.map(product => (
                        <li className="list-item product-item" key={product.id}>
                          <div className="item-header">
                            <span className="item-title">{product.title}</span>
                            {product.officialUrl && (
                              <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="official-link">
                                <FaExternalLinkAlt />
                              </a>
                            )}
                          </div>

                          {/* 発売日を商品名のすぐ下に表示 */}
                          <div className="item-release-date">
                            {formatDate(product.releaseDate, product.releaseDateDisplay)}
                          </div>
                          
                          {/* 複数バリエーションの表示（コンパクト版） */}
                          {product.variants && product.variants.length > 0 && (
                            <div className="product-variants-list">
                              {product.variants.map((variant) => (
                                <div key={variant.id} className="variant-list-item">
                                  <div className="variant-summary">
                                    <span className="variant-name">{variant.name}</span>
                                    {variant.price && (
                                      <span className="variant-price">¥{variant.price.toLocaleString()}</span>
                                    )}
                                    {variant.productCode && (
                                      <span className="variant-code">({variant.productCode})</span>
                                    )}
                                  </div>
                                  {variant.affiliateLinks && variant.affiliateLinks.length > 0 && (
                                    <div className="variant-links-inline">
                                      {variant.affiliateLinks.map(link => (
                                        <a 
                                          key={link.platform}
                                          href={link.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="affiliate-link-inline"
                                          title={`${link.platform}で購入`}
                                        >
                                          <FaShoppingCart />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* 単一商品の場合のフォールバック */}
                          {(!product.variants || product.variants.length === 0) && (
                            <>
                              {product.productCode && (
                                <span className="item-code">品番: {product.productCode}</span>
                              )}
                              {product.description && (
                                <div className="item-detail">
                                  <span>{product.description}</span>
                                </div>
                              )}
                              {product.affiliateLinks && product.affiliateLinks.length > 0 && (
                                <div className="affiliate-links">
                                  {product.affiliateLinks.map(link => (
                                    <a 
                                      key={link.platform}
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="affiliate-link"
                                      title={`${link.platform}で購入`}
                                    >
                                      <FaShoppingCart />
                                      <span>{link.platform}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </li>
                      ))
                    )
                  }

                  {/* 単独商品を統一リストに統合 */}
                  {tabData.standalone && tabData.standalone.length > 0 && 
                    tabData.standalone.map(product => (
                      <li className="list-item product-item" key={product.id}>
                        <div className="item-header">
                          <span className="item-title">{product.title}</span>
                          {product.officialUrl && (
                            <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="official-link">
                              <FaExternalLinkAlt />
                            </a>
                          )}
                        </div>

                        {/* 発売日を商品名のすぐ下に表示 */}
                        <div className="item-release-date">
                          {formatDate(product.releaseDate, product.releaseDateDisplay)}
                        </div>
                        
                        {/* 複数バリエーションの表示（コンパクト版） */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="product-variants-list">
                            {product.variants.map((variant) => (
                              <div key={variant.id} className="variant-list-item">
                                <div className="variant-summary">
                                  <span className="variant-name">{variant.name}</span>
                                  {variant.price && (
                                    <span className="variant-price">¥{variant.price.toLocaleString()}</span>
                                  )}
                                  {variant.productCode && (
                                    <span className="variant-code">({variant.productCode})</span>
                                  )}
                                </div>
                                {variant.affiliateLinks && variant.affiliateLinks.length > 0 && (
                                  <div className="variant-links-inline">
                                    {variant.affiliateLinks.map(link => (
                                      <a 
                                        key={link.platform}
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="affiliate-link-inline"
                                        title={`${link.platform}で購入`}
                                      >
                                        <FaShoppingCart />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* 単一商品の場合のフォールバック */}
                        {(!product.variants || product.variants.length === 0) && (
                          <>
                            {product.productCode && (
                              <span className="item-code">品番: {product.productCode}</span>
                            )}
                            {product.description && (
                              <div className="item-detail">
                                <span>{product.description}</span>
                              </div>
                            )}
                            {product.affiliateLinks && product.affiliateLinks.length > 0 && (
                              <div className="affiliate-links">
                                {product.affiliateLinks.map(link => (
                                  <a 
                                    key={link.platform}
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="affiliate-link"
                                    title={`${link.platform}で購入`}
                                  >
                                    <FaShoppingCart />
                                    <span>{link.platform}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    ))
                  }
                </ul>

                {/* データがない場合 */}
                {(!tabData.series || tabData.series.length === 0) && 
                 (!tabData.standalone || tabData.standalone.length === 0) && (
                  <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                )}
              </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}

// SSG (Static Site Generation) の実装
export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // 各カテゴリのデータを並行で取得
    const categories = ['cd', 'dvd', 'blu-ray', 'photobook', 'pamphlet', 'magazine', 'clear_card', 'goods'];
    const productPromises = categories.map(async (category) => {
      const response = await fetch(`${baseUrl}/api/products?tab=${category}`);
      if (!response.ok) {
        console.error(`Failed to fetch ${category} products`);
        return { category, data: { series: [], standalone: [] } };
      }
      const data = await response.json();
      return { category, data };
    });

    const results = await Promise.all(productPromises);
    
    // カテゴリ別にデータを整理
    const productData = {};
    results.forEach(({ category, data }) => {
      productData[category] = data;
    });

    return {
      props: {
        productData
      },
      revalidate: 3600 // 1時間ごとに再生成
    };
  } catch (error) {
    console.error('Static props generation error:', error);
    
    // エラー時のフォールバック
    const emptyData = { series: [], standalone: [] };
    return {
      props: {
        productData: {
          'cd': emptyData,
          'dvd': emptyData,
          'blu-ray': emptyData,
          'photobook': emptyData,
          'pamphlet': emptyData,
          'magazine': emptyData,
          'clear_card': emptyData,
          'goods': emptyData
        }
      },
      revalidate: 300 // エラー時は5分後に再試行
    };
  }
}