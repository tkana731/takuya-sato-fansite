// 構造化データ（Schema.org）のユーティリティ関数

// Organization（サイト組織）の構造化データ
export const getOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '声優・佐藤拓也さん非公式ファンサイト',
    description: '声優・佐藤拓也さんの出演作品、スケジュールなどの情報をまとめた非公式ファンサイト',
    url: 'https://takuya-sato-fansite.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://takuya-sato-fansite.com/images/ogp.png',
      width: 512,
      height: 512
    },
    foundingDate: '2025',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'ファンサイト運営',
      availableLanguage: 'Japanese'
    },
    sameAs: [],
    parentOrganization: {
      '@type': 'Organization',
      name: '非公式ファンサイト'
    }
  };
};

// Person（佐藤拓也さん）の構造化データ
export const getPersonSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '佐藤拓也',
    alternateName: ['Takuya Sato', 'さとう たくや'],
    description: '日本の男性声優。アニメ、ゲーム、吹き替えなど幅広い分野で活動。',
    jobTitle: '声優',
    nationality: {
      '@type': 'Country',
      name: '日本'
    },
    gender: 'Male',
    birthDate: '1984-05-19',
    birthPlace: {
      '@type': 'Place',
      name: '宮城県'
    },
    knowsAbout: ['声優', 'アニメ', 'ゲーム', '吹き替え', '朗読', '舞台'],
    hasOccupation: {
      '@type': 'Occupation',
      name: '声優',
      occupationLocation: {
        '@type': 'Country',
        name: '日本'
      }
    },
    worksFor: {
      '@type': 'Organization',
      name: '賢プロダクション'
    },
    url: 'https://takuya-sato-fansite.com',
    image: 'https://takuya-sato-fansite.com/images/ogp.png'
  };
};

// WebSite（サイト全体）の構造化データ
export const getWebSiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '声優・佐藤拓也さん非公式ファンサイト',
    alternateName: 'Takuya Sato Unofficial Fansite',
    description: '声優・佐藤拓也さんの出演作品、スケジュールなどの情報をまとめた非公式ファンサイト',
    url: 'https://takuya-sato-fansite.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://takuya-sato-fansite.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: '声優・佐藤拓也さん非公式ファンサイト',
      logo: {
        '@type': 'ImageObject',
        url: 'https://takuya-sato-fansite.com/images/ogp.png'
      }
    },
    inLanguage: 'ja-JP',
    copyrightYear: '2025',
    copyrightHolder: {
      '@type': 'Organization',
      name: '声優・佐藤拓也さん非公式ファンサイト'
    },
    about: {
      '@type': 'Person',
      name: '佐藤拓也',
      jobTitle: '声優'
    }
  };
};

// CreativeWork（作品）の構造化データ
export const getCreativeWorkSchema = (work) => {
  if (!work) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: work.title,
    description: work.description || `佐藤拓也さんが${work.role || 'キャラクター'}として出演`,
    creator: [
      {
        '@type': 'Person',
        name: '佐藤拓也',
        jobTitle: '声優'
      }
    ],
    dateCreated: work.year ? `${work.year}-01-01` : undefined,
    genre: work.category || 'アニメ',
    inLanguage: 'ja-JP',
    about: {
      '@type': 'Person',
      name: '佐藤拓也'
    }
  };
};

// Event（スケジュール）の構造化データ
export const getEventSchema = (event) => {
  if (!event) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || `佐藤拓也さんが出演するイベント`,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.isOnline ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    performer: {
      '@type': 'Person',
      name: '佐藤拓也',
      jobTitle: '声優'
    },
    organizer: event.organizer ? {
      '@type': 'Organization',
      name: event.organizer
    } : undefined,
    location: event.location ? {
      '@type': 'Place',
      name: event.location
    } : undefined,
    url: event.url,
    image: 'https://takuya-sato-fansite.com/images/ogp.png'
  };
};

// Product（商品）の構造化データ
export const getProductSchema = (product) => {
  if (!product) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `佐藤拓也さん関連商品`,
    brand: product.brand || '佐藤拓也関連',
    category: product.category,
    releaseDate: product.releaseDate,
    offers: product.price ? {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'JPY',
      availability: product.isPreorder ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
      url: product.affiliateUrl
    } : undefined,
    associatedMedia: {
      '@type': 'Person',
      name: '佐藤拓也',
      jobTitle: '声優'
    }
  };
};