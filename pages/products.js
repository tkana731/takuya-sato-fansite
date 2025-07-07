import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';
import { FaExternalLinkAlt, FaShoppingCart } from 'react-icons/fa';

export default function ProductsPage({ productData }) {
  const [activeTab, setActiveTab] = useState('cd');

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
      'goods': 'グッズ'
    };
    return categoryLabels[code] || code;
  };

  // メタデータの生成
  const generateMetadata = () => {
    const currentTabName = getCategoryLabel(activeTab);
    const title = `佐藤拓也さん関連商品一覧 - ${currentTabName} | 非公式ファンサイト`;
    const description = `声優・佐藤拓也さんの${currentTabName}商品を一覧で掲載。発売日、価格、購入リンクなどの詳細情報をまとめています。`;

    return { title, description };
  };

  // 構造化データの生成
  const generateSchemaData = () => {
    const currentProducts = productData?.[activeTab] || { series: [], standalone: [] };
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

  const { title: pageTitle, description: pageDescription } = generateMetadata();

  // タブのリスト
  const tabs = [
    { code: 'cd', label: 'CD' },
    { code: 'dvd', label: 'DVD' },
    { code: 'blu-ray', label: 'Blu-ray' },
    { code: 'photobook', label: 'フォトブック' },
    { code: 'pamphlet', label: 'パンフレット' },
    { code: 'magazine', label: '雑誌' },
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

          {/* カテゴリタブ - worksページと同じ構造 */}
          <div className="works-tabs">
            <div className="works-tabs-container">
              {tabs.map(tab => (
                <button
                  key={tab.code}
                  className={`works-tab ${activeTab === tab.code ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.code)}
                  role="tab"
                  aria-selected={activeTab === tab.code}
                  aria-controls={`${tab.code}-content`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 各タブのコンテンツ */}
          {tabs.map(tab => {
            const tabData = productData?.[tab.code] || { series: [], standalone: [] };
            
            return (
              <div 
                key={tab.code}
                id={`${tab.code}-content`} 
                className={`works-content ${activeTab === tab.code ? 'active' : ''}`}
                role="tabpanel"
                aria-labelledby={`${tab.code}-tab`}
              >
                <div className="works-list">
                  {/* シリーズ商品 */}
                  {tabData.series && tabData.series.length > 0 && (
                    <>
                      {tabData.series.map(series => (
                        <div key={series.id} className="product-series">
                          <h3 className="list-title">{series.name}</h3>
                          {series.description && (
                            <p className="series-description">{series.description}</p>
                          )}
                          <ul className="list-items">
                            {series.products.map(product => (
                              <li className="list-item product-item" key={product.id}>
                                <div className="item-header">
                                  <span className="item-title">
                                    {product.volumeTitle ? 
                                      `${product.title} ${product.volumeTitle}` : 
                                      product.title
                                    }
                                  </span>
                                  {product.officialUrl && (
                                    <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="official-link">
                                      <FaExternalLinkAlt />
                                    </a>
                                  )}
                                </div>
                                {product.variation && (
                                  <span className="item-variation">{product.variation.variationName}</span>
                                )}
                                {product.productCode && (
                                  <span className="item-code">品番: {product.productCode}</span>
                                )}
                                <div className="item-date-section">
                                  <span className="item-date">
                                    {product.isPreorder && <span className="preorder-badge">予約受付中</span>}
                                    {formatDate(product.releaseDate, product.releaseDateDisplay)}
                                  </span>
                                </div>
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
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </>
                  )}

                  {/* 単独商品 */}
                  {tabData.standalone && tabData.standalone.length > 0 && (
                    <>
                      <h3 className="list-title">{getCategoryLabel(tab.code)}商品一覧</h3>
                      <ul className="list-items">
                        {tabData.standalone.map(product => (
                          <li className="list-item product-item" key={product.id}>
                            <div className="item-header">
                              <span className="item-title">{product.title}</span>
                              {product.officialUrl && (
                                <a href={product.officialUrl} target="_blank" rel="noopener noreferrer" className="official-link">
                                  <FaExternalLinkAlt />
                                </a>
                              )}
                            </div>
                            {product.variationDescription && (
                              <span className="item-variation">{product.variationDescription}</span>
                            )}
                            {product.productCode && (
                              <span className="item-code">品番: {product.productCode}</span>
                            )}
                            <div className="item-date-section">
                              <span className="item-date">
                                {product.isPreorder && <span className="preorder-badge">予約受付中</span>}
                                {formatDate(product.releaseDate, product.releaseDateDisplay)}
                              </span>
                            </div>
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
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

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
    const categories = ['cd', 'dvd', 'blu-ray', 'photobook', 'pamphlet', 'magazine', 'goods'];
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
          'goods': emptyData
        }
      },
      revalidate: 300 // エラー時は5分後に再試行
    };
  }
}