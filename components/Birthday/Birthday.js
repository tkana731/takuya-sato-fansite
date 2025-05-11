// components/Birthday/Birthday.js
export default function Birthday({ characters = [] }) {
    // 誕生日キャラクターがいない場合はコンポーネント自体を表示しない
    if (characters.length === 0) {
        return null;
    }

    return (
        <section className="birthday-section" id="birthday">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">TODAY&apos;S BIRTHDAY</h2>
                    <p className="section-subtitle">今日が誕生日のキャラクター</p>
                </div>
                <div className="birthday-cards">
                    {characters.map(character => (
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