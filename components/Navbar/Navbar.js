// components/Navbar/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const isHomePage = router.pathname === '/';

    // トグルボタンのクリックハンドラ
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        // メニュー開閉時にbodyのスクロールを制御
        if (typeof document !== 'undefined') {
            document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
        }
    };

    // リンクのクリックでメニューを閉じる
    const handleLinkClick = () => {
        setIsMenuOpen(false);
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
        }
    };

    // ハッシュリンクの処理を改善
    const handleHashLinkClick = (e, hash) => {
        // モバイルメニューを閉じる
        handleLinkClick();

        if (isHomePage && hash) {
            e.preventDefault();

            // ターゲット要素を取得
            const targetElement = document.querySelector(hash);
            if (!targetElement) return;

            // ヘッダーの高さを取得（余白なし）
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 80;

            // スクロール位置を計算（余白を調整）
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            // スクロール実行
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // URLのハッシュを更新
            history.pushState(null, null, hash);
        }
    };

    // ESCキーでメニューを閉じる
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleEscKey = (e) => {
                if (e.key === 'Escape' && isMenuOpen) {
                    setIsMenuOpen(false);
                    document.body.style.overflow = '';
                }
            };

            window.addEventListener('keydown', handleEscKey);
            return () => {
                window.removeEventListener('keydown', handleEscKey);
            };
        }
    }, [isMenuOpen]);

    return (
        <header className="header">
            {/* ヘッダー専用のバブル背景 */}
            <div className="header-bubbles">
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
            </div>
            <div className="header-container">
                <div className="logo">
                    <Link href="/" className="logo-text">
                        <div className="site-title-wrapper">
                            <span className="site-title-main">TAKUYA SATO</span>
                            <span className="site-title-sub">非公式ファンサイト</span>
                            <div className="logo-accent"></div>
                        </div>
                    </Link>
                </div>

                {/* デスクトップ用ナビゲーション - header-containerの中に配置 */}
                <nav className="desktop-nav">
                    <ul className="nav-menu">
                        <li>
                            <Link href="/" className={router.pathname === '/' ? "active" : ""}>
                                HOME
                            </Link>
                        </li>
                        <li>
                            <Link href="/schedule" className={router.pathname === '/schedule' ? "active" : ""}>
                                SCHEDULE
                            </Link>
                        </li>
                        <li>
                            <Link href="/works" className={router.pathname === '/works' ? "active" : ""}>
                                WORKS
                            </Link>
                        </li>
                        <li>
                            <Link href="/video" className={router.pathname === '/video' ? "active" : ""}>
                                VIDEO
                            </Link>
                        </li>
                        <li>
                            <Link href="/characters" className={router.pathname === '/characters' ? "active" : ""}>
                                CHARACTERS
                            </Link>
                        </li>
                        <li>
                            <Link href="/event-map" className={router.pathname === '/event-map' ? "active" : ""}>
                                EVENT MAP
                            </Link>
                        </li>
                        <li>
                            <Link href="/social-posts" className={router.pathname === '/social-posts' ? "active" : ""}>
                                SOCIAL
                            </Link>
                        </li>
                        <li>
                            {isHomePage ? (
                                <a href="#links" onClick={(e) => handleHashLinkClick(e, "#links")}>LINKS</a>
                            ) : (
                                <Link href="/#links">LINKS</Link>
                            )}
                        </li>
                    </ul>
                </nav>

                {/* ハンバーガーメニューボタン */}
                <button
                    className={`hamburger-button ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
                    aria-expanded={isMenuOpen}
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>

            {/* フルスクリーンオーバーレイメニュー */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
                <nav className="mobile-nav">
                    <ul className="mobile-nav-menu">
                        <li>
                            <Link href="/" onClick={handleLinkClick}>HOME</Link>
                        </li>
                        <li>
                            <Link href="/schedule" onClick={handleLinkClick}>SCHEDULE</Link>
                        </li>
                        <li>
                            <Link href="/works" onClick={handleLinkClick}>WORKS</Link>
                        </li>
                        <li>
                            <Link href="/video" onClick={handleLinkClick}>VIDEO</Link>
                        </li>
                        <li>
                            <Link href="/characters" onClick={handleLinkClick}>CHARACTERS</Link>
                        </li>
                        <li>
                            <Link href="/event-map" onClick={handleLinkClick}>EVENT MAP</Link>
                        </li>
                        <li>
                            <Link href="/social-posts" onClick={handleLinkClick}>SOCIAL</Link>
                        </li>
                        <li>
                            {isHomePage ? (
                                <a href="#links" onClick={(e) => handleHashLinkClick(e, "#links")}>LINKS</a>
                            ) : (
                                <Link href="/#links" onClick={handleLinkClick}>LINKS</Link>
                            )}
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}