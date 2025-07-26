import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';
import BirthdayCalendar from '../components/BirthdayCalendar/BirthdayCalendar';

export default function BirthdayCalendarPage({ characters }) {
    // ページのメタデータ
    const pageTitle = 'キャラクター誕生日カレンダー | 佐藤拓也さん非公式ファンサイト';
    const pageDescription = '声優・佐藤拓也さんが演じたキャラクターの誕生日を月別カレンダー形式で表示。誕生日が登録されているキャラクターを一覧で確認できます。';

    // 構造化データを作成
    const createCalendarSchemaData = () => {
        if (!characters.length) return null;

        // 誕生日があるキャラクターのみ抽出
        const charactersWithBirthdays = characters.filter(char => char.birthday);

        return {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'キャラクター誕生日カレンダー',
            description: pageDescription,
            numberOfItems: charactersWithBirthdays.length,
            itemListElement: charactersWithBirthdays.map((character, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Person',
                    name: character.name,
                    birthDate: character.birthday,
                    description: `${character.workTitle ? character.workTitle + 'の' : ''}キャラクター`,
                    performer: {
                        '@type': 'Person',
                        name: '佐藤拓也'
                    }
                }
            }))
        };
    };

    return (
        <Layout>
            <SEO
                title={pageTitle}
                description={pageDescription}
                type="article"
            />
            {characters.length > 0 && (
                <SchemaOrg
                    type="ItemList"
                    data={createCalendarSchemaData()}
                />
            )}

            <section className="characters-page-section">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">BIRTHDAY CALENDAR</h1>
                        <p className="section-subtitle">キャラクター誕生日カレンダー</p>
                    </div>

                    <div className="birthday-calendar-wrapper">
                        <BirthdayCalendar characters={characters} />
                    </div>
                </div>
            </section>
        </Layout>
    );
}

// SSG (Static Site Generation) の実装
export async function getStaticProps() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        
        const response = await fetch(`${baseUrl}/api/characters`);
        
        if (!response.ok) {
            throw new Error('Characters data fetch failed');
        }
        
        const characters = await response.json();
        
        return {
            props: {
                characters: characters || []
            },
            revalidate: 3600 // 1時間ごとに再生成
        };
    } catch (error) {
        console.error('Static props generation error:', error);
        
        // エラー時のフォールバック
        return {
            props: {
                characters: []
            },
            revalidate: 300 // エラー時は5分後に再試行
        };
    }
}