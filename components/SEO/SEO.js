import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SEO({
    title = '佐藤拓也さん非公式ファンサイト',
    description = '声優・佐藤拓也さんの出演作品、スケジュール、最新情報をまとめた非公式ファンサイトです。',
    image = '/images/ogp.jpg',
    type = 'website'
}) {
    const router = useRouter();
    const canonicalUrl = `https://takuya-sato.example.com${router.asPath}`;
    const siteTitle = '佐藤拓也さん非公式ファンサイト';

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
            <meta property="og:image" content={`https://takuya-sato.example.com${image}`} />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:locale" content="ja_JP" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`https://takuya-sato.example.com${image}`} />

            {/* 検索エンジン向けメタタグ */}
            <meta name="robots" content="index, follow" />
            <meta name="keywords" content="佐藤拓也,声優,アニメ,出演作品,スケジュール,非公式,ファンサイト" />
        </Head>
    );
}