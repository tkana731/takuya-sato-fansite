import { useState, useEffect } from 'react';

export default function Birthday() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBirthdays = async () => {
            try {
                const response = await fetch('/api/birthdays');
                if (!response.ok) {
                    throw new Error('データの取得に失敗しました');
                }
                const data = await response.json();
                setCharacters(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBirthdays();
    }, []);

    if (loading) return null;

    if (error) return null;

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