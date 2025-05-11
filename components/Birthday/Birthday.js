// components/Birthday/Birthday.js
export default function Birthday({ characters = [] }) {
    // APIから取得したデータがない場合のフォールバックデータ
    const fallbackCharacters = characters.length ? characters : [
        {
            id: '1',
            name: '十龍之介',
            seriesName: 'IDOLiSH7'
        },
        {
            id: '2',
            name: '燭台切光忠',
            seriesName: '刀剣乱舞'
        }
    ];

    return (
        <section className="birthday-section" id="birthday">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">TODAY&apos;S BIRTHDAY</h2>
                    <p className="section-subtitle">今日が誕生日のキャラクター</p>
                </div>
                <div className="birthday-cards">
                    {fallbackCharacters.map(character => (
                        <div className="birthday-card" key={character.id}>
                            <div className="birthday-content">
                                <h3 className="birthday-title">{character.name}</h3>
                                <p className="birthday-series">{character.seriesName}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}