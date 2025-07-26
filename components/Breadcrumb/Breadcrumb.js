import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome } from 'react-icons/fa';

const Breadcrumb = ({ customItems }) => {
  const router = useRouter();
  const { pathname } = router;

  // ページごとのパンくずリスト定義
  const getDefaultBreadcrumbItems = () => {
    const items = [{ label: 'HOME', path: '/', icon: FaHome }];

    switch (pathname) {
      case '/schedule':
        items.push({ label: 'SCHEDULE', path: '/schedule' });
        break;
      case '/works':
        items.push({ label: 'WORKS', path: '/works' });
        break;
      case '/video':
        items.push({ label: 'VIDEO', path: '/video' });
        break;
      case '/characters':
        items.push({ label: 'CHARACTERS', path: '/characters' });
        break;
      case '/event-map':
        items.push({ label: 'EVENT MAP', path: '/event-map' });
        break;
      case '/songs':
        items.push({ label: 'SONGS', path: '/songs' });
        break;
      case '/products':
        items.push({ label: 'PRODUCTS', path: '/products' });
        break;
      case '/social-posts':
        items.push({ label: 'SOCIAL', path: '/social-posts' });
        break;
      case '/search':
        items.push({ label: 'SEARCH', path: '/search' });
        break;
      default:
        break;
    }

    return items;
  };

  const breadcrumbItems = customItems || getDefaultBreadcrumbItems();

  // 構造化データ用のJSON-LD生成
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: {
        '@type': 'WebPage',
        '@id': `https://takuya-sato-fansite.com${item.path}`,
        url: `https://takuya-sato-fansite.com${item.path}`,
        name: item.label
      }
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="パンくずリスト" className="breadcrumb">
        <ol className="breadcrumb-list">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const Icon = item.icon;

            return (
              <li key={item.path} className="breadcrumb-item">
                {!isLast ? (
                  <>
                    <Link href={item.path} className="breadcrumb-link">
                      {Icon && <Icon className="breadcrumb-icon" />}
                      <span>{item.label}</span>
                    </Link>
                    <span className="breadcrumb-separator" aria-hidden="true">
                      /
                    </span>
                  </>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {Icon && <Icon className="breadcrumb-icon" />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumb;