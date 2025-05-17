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
                        {/* <span className="hero-title-large">Sato, Takuya</span>
                        <span className="hero-title-sub">Unofficial Fansite</span> */}
                    </h1>
                    <div className="hero-description">
                        <p>
                            このサイトは声優・佐藤拓也さんのファンが作成した<span className="hero-highlight">非公式ファンサイト</span>です。
                        </p>
                        <p>
                            放送中コンテンツ、スケジュール、出演作品一覧、YouTube動画などを掲載しています。
                        </p>
                        <p className="hero-disclaimer">
                            ※当サイトは佐藤拓也さん及び所属事務所とは一切関係ありません。<br />
                            正確な情報はご本人の<a href="https://x.com/5tAkUyA5" target="_blank" rel="noopener noreferrer" className="hero-link">X</a>または<a href="https://www.kenproduction.co.jp/talent/39" target="_blank" rel="noopener noreferrer" className="hero-link">所属事務所公式サイト</a>でご確認ください。
                        </p>
                    </div>
                </div>
            </div>
        </section >
    );
}