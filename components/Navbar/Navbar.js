// components/Navbar/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaGlasses, FaSearch } from 'react-icons/fa';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

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

    // 検索ページに遷移
    const goToSearch = () => {
        router.push('/search');
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
                            <div className="site-title-main-container">
                                <FaGlasses className="glasses-icon" />
                                <span className="site-title-main">TAKUYA SATO</span>
                            </div>
                            <span className="site-title-sub">非公式ファンサイト</span>
                            <div className="logo-accent"></div>
                        </div>
                    </Link>
                </div>

                {/* デスクトップ用ナビゲーション - header-containerの中に配置 */}
                <nav className="desktop-nav">
                    <ul className="nav-menu">
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
                            <Link href="/songs" className={router.pathname === '/songs' ? "active" : ""}>
                                SONGS
                            </Link>
                        </li>
                        <li>
                            <Link href="/products" className={router.pathname === '/products' ? "active" : ""}>
                                PRODUCTS
                            </Link>
                        </li>
                        <li>
                            <Link href="/social-posts" className={router.pathname === '/social-posts' ? "active" : ""}>
                                SOCIAL
                            </Link>
                        </li>
                        <li>
                            <button 
                                onClick={goToSearch}
                                className="search-toggle"
                                aria-label="検索ページに移動"
                            >
                                <FaSearch />
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* モバイル用検索アイコン */}
                <button 
                    onClick={goToSearch}
                    className="mobile-search-toggle"
                    aria-label="検索ページに移動"
                >
                    <FaSearch />
                </button>

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
                            <Link href="/songs" onClick={handleLinkClick}>SONGS</Link>
                        </li>
                        <li>
                            <Link href="/products" onClick={handleLinkClick}>PRODUCTS</Link>
                        </li>
                        <li>
                            <Link href="/social-posts" onClick={handleLinkClick}>SOCIAL</Link>
                        </li>
                    </ul>
                </nav>
            </div>

        </header>
    );
}