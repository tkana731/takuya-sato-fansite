// SEO関連のユーティリティ関数

// Twitter関連の設定
export const twitterConfig = {
  site: '@5tAkUyA5', // 佐藤拓也さんの公式Twitterアカウント
  creator: '@5tAkUyA5', // 佐藤拓也さんの公式Twitterアカウント
  // 注: ファンサイト運営者のアカウントではなく、佐藤拓也さん本人のアカウントを使用
};

// OGP画像のフォールバック処理
export const getOGPImage = (customImage) => {
  // カスタム画像が指定されている場合は優先
  if (customImage) {
    return customImage;
  }
  
  // デフォルトのOGP画像パス
  const defaultImages = [
    '/images/ogp.png',
    '/images/ogp.jpg', 
    '/android-chrome-512x512.png' // 最終フォールバック
  ];
  
  // 最初に見つかった画像を返す（実際のファイル存在確認は省略）
  return defaultImages[0];
};

// ページタイトルの統一フォーマット
export const formatPageTitle = (pageTitle, siteTitle = '声優・佐藤拓也さん非公式ファンサイト') => {
  if (!pageTitle || pageTitle === siteTitle) {
    return siteTitle;
  }
  return `${pageTitle} | ${siteTitle}`;
};

// SEO用キーワードの生成
export const generateKeywords = (customKeywords, defaultKeywords = [
  '佐藤拓也',
  '声優', 
  'アニメ',
  'ゲーム',
  '出演作品',
  'スケジュール',
  '非公式',
  'ファンサイト',
  'キャラクター',
  '楽曲',
  '誕生日'
]) => {
  if (customKeywords) {
    return Array.isArray(customKeywords) 
      ? [...new Set([...customKeywords, ...defaultKeywords])].join(',')
      : customKeywords;
  }
  return defaultKeywords.join(',');
};

// Twitterカードタイプの自動選択
export const getTwitterCardType = (contentType, hasImage = true) => {
  // 画像がない場合はsummaryカードを使用
  if (!hasImage) {
    return 'summary';
  }
  
  // コンテンツタイプに応じてカードタイプを選択
  switch (contentType) {
    case 'video':
      return 'player'; // 動画コンテンツ
    case 'article':
    case 'blog':
      return 'summary_large_image'; // 記事やブログポスト
    case 'product':
      return 'summary_large_image'; // 商品ページ
    case 'event':
      return 'summary_large_image'; // イベントページ
    default:
      return 'summary_large_image'; // デフォルトは大きな画像カード
  }
};

// TwitterカードのDescription最適化（280文字制限）
export const optimizeTwitterDescription = (description) => {
  if (!description) return '';
  
  // Twitter投稿の文字数制限を考慮して200文字以内に調整
  const maxLength = 200;
  
  if (description.length <= maxLength) {
    return description;
  }
  
  // 文の途中で切れないように調整
  const truncated = description.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('。');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength - 50) {
    return truncated.substring(0, lastPeriod + 1);
  } else if (lastSpace > maxLength - 30) {
    return truncated.substring(0, lastSpace) + '…';
  } else {
    return truncated + '…';
  }
};