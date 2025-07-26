import React from 'react';
import { 
    getOrganizationSchema, 
    getPersonSchema, 
    getWebSiteSchema,
    getCreativeWorkSchema,
    getEventSchema,
    getProductSchema
} from '../../utils/structuredData';

export default function SchemaOrg({
    type = 'WebSite',
    data = {}
}) {
    // 構造化データ生成関数のマッピング
    const schemaGenerators = {
        Organization: () => ({ ...getOrganizationSchema(), ...data }),
        Person: () => ({ ...getPersonSchema(), ...data }),
        WebSite: () => ({ ...getWebSiteSchema(), ...data }),
        CreativeWork: () => getCreativeWorkSchema(data),
        Event: () => getEventSchema(data),
        Product: () => getProductSchema(data),
        ItemList: () => ({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            ...data
        }),
        VideoObject: () => ({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            ...data
        }),
        BreadcrumbList: () => ({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            ...data
        })
    };

    // 適切なスキーマジェネレーターを選択し、スキーマデータを生成
    const generator = schemaGenerators[type] || schemaGenerators.WebSite;
    const schemaData = generator();

    // データが null の場合は何もレンダリングしない
    if (!schemaData) {
        return null;
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}