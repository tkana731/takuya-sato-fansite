import Head from 'next/head';
import { useRouter } from 'next/router';
import { getOGPImage, generateKeywords, twitterConfig, getTwitterCardType, optimizeTwitterDescription } from '../../utils/seo';

export default function SEO({
    title = '声優・佐藤拓也さん非公式ファンサイト',
    description = '声優・佐藤拓也さんの出演作品、スケジュールなどの情報をまとめた非公式ファンサイトです。',
    keywords,
    image,
    type = 'website',
    author,
    twitterCard,
    contentType
}) {
    const router = useRouter();
    const canonicalUrl = `https://takuya-sato-fansite.com${router.asPath}`;
    const siteTitle = '声優・佐藤拓也さん非公式ファンサイト';
    
    // OGP画像のフォールバック処理
    const ogpImage = getOGPImage(image);
    
    // Twitterカードタイプの自動選択
    const finalTwitterCard = twitterCard || getTwitterCardType(contentType, !!ogpImage);
    
    // Twitter用の説明文最適化
    const twitterDescription = optimizeTwitterDescription(description);

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* OGP Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={`https://takuya-sato-fansite.com${ogpImage}`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:locale" content="ja_JP" />
            
            {/* 記事ページ用のOGPメタタグ */}
            {type === 'article' && author && (
                <>
                    <meta property="article:author" content={author} />
                    <meta property="article:section" content="声優情報" />
                    <meta property="article:published_time" content={new Date().toISOString()} />
                </>
            )}

            {/* Twitter Card */}
            <meta name="twitter:card" content={finalTwitterCard} />
            <meta name="twitter:site" content={twitterConfig.site} />
            <meta name="twitter:creator" content={twitterConfig.creator} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={twitterDescription} />
            <meta name="twitter:image" content={`https://takuya-sato-fansite.com${ogpImage}`} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:image:width" content="1200" />
            <meta name="twitter:image:height" content="630" />
            <meta name="twitter:domain" content="takuya-sato-fansite.com" />
            <meta name="twitter:url" content={canonicalUrl} />
            
            {/* 記事ページ用のメタタグ */}
            {type === 'article' && author && (
                <meta name="article:author" content={author} />
            )}

            {/* 検索エンジン向けメタタグ */}
            <meta name="robots" content="index, follow" />
            <meta name="keywords" content={generateKeywords(keywords)} />
        </Head>
    );
}