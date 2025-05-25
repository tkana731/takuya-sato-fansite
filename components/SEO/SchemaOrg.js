import React from 'react';

export default function SchemaOrg({
    type = 'WebSite',
    data = {}
}) {
    const schemas = {
        WebSite: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://takuya-sato-fansite.vercel.app/',
            name: '佐藤拓也さん非公式ファンサイト',
            description: '声優・佐藤拓也さんの出演作品、スケジュール、最新情報をまとめた非公式ファンサイトです。',
            ...data
        },
        Person: {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: '佐藤拓也',
            url: 'https://takuya-sato-fansite.vercel.app/',
            jobTitle: '声優',
            description: '声優として多数のアニメ、ゲーム、吹き替え作品に出演',
            sameAs: [
                'https://www.kenproduction.co.jp/talent/39',
                'https://x.com/5takuya5',
                'https://www.instagram.com/takuya.voices/'
            ],
            ...data
        },
        Event: {
            '@context': 'https://schema.org',
            '@type': 'Event',
            ...data
        },
        VideoObject: {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            ...data
        }
    };

    const schemaData = schemas[type] || schemas.WebSite;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}