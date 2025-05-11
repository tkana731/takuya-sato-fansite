// components/Layout/Layout.js
import Head from 'next/head';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useEffect, useState } from 'react';

export default function Layout({ children, title = '佐藤拓也ファンサイト' }) {
    const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);

    // バブルアニメーション作成関数
    const createBubbles = () => {
        if (typeof window !== 'undefined') {
            const bubbles = document.querySelector('.bubbles');
            if (!bubbles) return;

            const numberOfBubbles = 25;
            const solidColors = ['#ffffff', '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3'];
            const outlineColors = ['#ffffff', '#E3F2FD', '#90CAF9', '#2196F3', '#1976D2'];

            // 既存のバブルに加えて追加のバブルを作成
            for (let i = 7; i < numberOfBubbles; i++) {
                const bubble = document.createElement('div');
                bubble.classList.add('bubble');

                const size = Math.random() * 40 + 15;
                bubble.style.width = `${size}px`;
                bubble.style.height = `${size}px`;
                bubble.style.left = `${Math.random() * 100}%`;

                const isSolid = Math.random() > 0.5;
                if (isSolid) {
                    const colorIndex = Math.floor(Math.random() * solidColors.length);
                    bubble.style.backgroundColor = solidColors[colorIndex];
                    bubble.classList.add('bubble-solid');
                } else {
                    const colorIndex = Math.floor(Math.random() * outlineColors.length);
                    bubble.style.border = `2px solid ${outlineColors[colorIndex]}`;
                    bubble.style.backgroundColor = 'transparent';
                    bubble.classList.add('bubble-outline');
                }

                const duration = Math.random() * 10 + 12;
                const delay = Math.random() * 6;
                bubble.style.animationDuration = `${duration}s`;
                bubble.style.animationDelay = `${delay}s`;

                bubbles.appendChild(bubble);
            }
        }
    };

    useEffect(() => {
        // バブルアニメーション作成
        createBubbles();

        // スクロールイベントリスナー
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsBackToTopVisible(true);
            } else {
                setIsBackToTopVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content="声優・佐藤拓也さんの非公式ファンサイトです" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* シャボン玉アニメーション */}
            <div className="bubbles">
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
            </div>

            <Navbar />

            <main>{children}</main>

            {/* トップに戻るボタン */}
            <div
                className={`back-to-top ${isBackToTopVisible ? 'visible' : ''}`}
                onClick={scrollToTop}
                role="button"
                tabIndex={0}
                aria-label="ページトップに戻る"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                </svg>
            </div>

            <Footer />
        </>
    );
}