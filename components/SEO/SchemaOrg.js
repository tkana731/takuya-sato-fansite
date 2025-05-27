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
            alternateName: ['さとう たくや', 'Sato Takuya', 'SATO TAKUYA'],
            url: 'https://takuya-sato-fansite.vercel.app/',
            jobTitle: '声優',
            description: '声優・佐藤拓也（さとう たくや）。賢プロダクション所属。多数のアニメ、ゲーム、吹き替え作品で主要キャラクターを演じる人気声優。代表作は「アイドリッシュセブン」十龍之介役、「キャプテン翼」日向小次郎役など。',
            worksFor: {
                '@type': 'Organization',
                name: '賢プロダクション',
                url: 'https://www.kenproduction.co.jp/'
            },
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