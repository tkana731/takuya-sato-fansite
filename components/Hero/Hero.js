// components/Hero/Hero.js
import { useEffect, useRef } from 'react';

export default function Hero() {
    const titleRef = useRef(null);

    // タイトルにアニメーション効果を適用
    useEffect(() => {
        if (!titleRef.current) return;

        const titleElement = titleRef.current;
        titleElement.classList.add('fade-in-up');

        return () => {
            titleElement.classList.remove('fade-in-up');
        };
    }, []);

    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title" ref={titleRef}>
                        <span className="hero-title-large">佐藤拓也</span>
                        <span className="hero-title-sub">Voice Actor Fan Site</span>
                    </h1>
                    <div className="hero-description">
                        <p>
                            このサイトは声優・佐藤拓也さんのファンによって運営されている<span className="hero-highlight">非公式ファンサイト</span>です。
                            出演作品、スケジュール、最新情報などをファンの視点から発信しています。
                        </p>
                        <p className="hero-disclaimer">
                            ※当サイトは佐藤拓也さん及び所属事務所とは一切関係ありません。<br />
                            正確な情報は<a href="https://www.kenproduction.co.jp/talent/39" target="_blank" rel="noopener noreferrer" className="hero-link">公式サイト</a>でご確認ください。
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}