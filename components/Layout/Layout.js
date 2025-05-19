// components/Layout/Layout.js
import Head from 'next/head';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Layout({ children, title = '佐藤拓也さん非公式ファンサイト' }) {
    const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
    const router = useRouter();
    const layoutRef = useRef(null);
    const lastScrollTime = useRef(0);
    const scrollInProgress = useRef(false);

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

    // ヘッダーの高さを取得
    const getHeaderHeight = () => {
        const header = document.querySelector('.header');
        return header ? header.offsetHeight : 80; // デフォルト値は80px
    };

    // ページ内リンクのスクロール処理を改善する関数
    const scrollToHashElement = (hash, delay = 0, attempt = 0) => {
        setTimeout(() => {
            if (!hash) return;

            const element = document.querySelector(hash);
            if (!element) {
                // 要素が見つからない場合、再試行（5回まで）
                if (attempt < 5) {
                    console.log(`Element ${hash} not found, retrying... (${attempt + 1}/5)`);
                    scrollToHashElement(hash, 200, attempt + 1);
                }
                return;
            }

            // ヘッダーの高さを動的に取得
            const headerHeight = getHeaderHeight(); // 余白を減らす (以前は+20)

            // 正確な位置計算（ページ読み込み完了後）
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementTop - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // 追加のスクロール確認は必要な場合のみ実行する
            // 大きな誤差がある場合のみ再調整
            setTimeout(() => {
                const newElementTop = element.getBoundingClientRect().top;
                // 要素がまだ明らかに見えていない場合のみ位置を微調整
                if (Math.abs(newElementTop) > 50) {
                    const newOffset = window.pageYOffset + newElementTop - headerHeight;
                    window.scrollTo({
                        top: newOffset,
                        behavior: 'smooth'
                    });
                }
            }, 600);
        }, delay);
    };

    // ページ内ハッシュリンクのクリックイベントをカスタマイズ
    const setupHashLinkHandler = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const element = document.querySelector(href);
                    if (element) {
                        // ヘッダーの高さのみを考慮（余白を削除）
                        const headerHeight = getHeaderHeight();
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // URLにハッシュを追加（必要に応じて履歴に追加）
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    };

    // ページ遷移後のハッシュスクロール処理
    const handleRouteChangeComplete = (url) => {
        const { hash } = new URL(url, window.location.origin);
        if (hash) {
            // ページ遷移後は長めの遅延を設定（コンテンツの読み込みを待つ）
            scrollToHashElement(hash, 500);
        }
    };

    // インラインで定義したトップにスクロールする関数
    const directScrollToTop = () => {
        // URLからハッシュを削除
        if (window.location.hash) {
            history.pushState("", document.title, window.location.pathname);
        }

        // 直接スクロールを実行
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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

        // ページ内ハッシュリンクのカスタムハンドラをセットアップ
        setupHashLinkHandler();

        // 初回ロード時にハッシュがある場合の処理
        if (window.location.hash) {
            // 初回ロード時は少し長めの遅延を設定
            scrollToHashElement(window.location.hash, 700);
        }

        // ルート変更を監視（ページ遷移後のハッシュスクロール用）
        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [router.asPath]); // ルートが変わるたびに再実行

    return (
        <div ref={layoutRef}>
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

            {/* トップに戻るボタン - オンクリックハンドラを単純化 */}
            <button
                className={`back-to-top ${isBackToTopVisible ? 'visible' : ''}`}
                onClick={directScrollToTop}
                aria-label="ページトップに戻る"
                type="button"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                </svg>
            </button>

            <Footer />
        </div>
    );
}