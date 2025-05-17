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
                    <Link href="/" legacyBehavior>
                        <a className="logo-text">
                            <div className="site-title-wrapper">
                                <span className="site-title-main">TAKUYA SATO</span>
                                <span className="site-title-sub">非公式ファンサイト</span>
                                <div className="logo-accent"></div>
                            </div>
                        </a>
                    </Link>
                </div>

                {/* デスクトップ用ナビゲーション - header-containerの中に配置 */}
                <nav className="desktop-nav">
                    <ul className="nav-menu">
                        <li><Link href="/" legacyBehavior><a className={router.pathname === '/' ? "active" : ""}>HOME</a></Link></li>
                        <li><Link href="/schedule" legacyBehavior><a className={router.pathname === '/schedule' ? "active" : ""}>SCHEDULE</a></Link></li>
                        <li><Link href={isHomePage ? "#works" : "/#works"} legacyBehavior><a>WORKS</a></Link></li>
                        <li><Link href="/video" legacyBehavior><a className={router.pathname === '/video' ? "active" : ""}>VIDEO</a></Link></li>
                        <li><Link href={isHomePage ? "#links" : "/#links"} legacyBehavior><a>LINKS</a></Link></li>
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
                        <li><Link href="/" legacyBehavior><a onClick={handleLinkClick}>HOME</a></Link></li>
                        <li><Link href="/schedule" legacyBehavior><a onClick={handleLinkClick}>SCHEDULE</a></Link></li>
                        <li><Link href={isHomePage ? "#works" : "/#works"} legacyBehavior><a onClick={handleLinkClick}>WORKS</a></Link></li>
                        <li><Link href="/video" legacyBehavior><a onClick={handleLinkClick}>VIDEO</a></Link></li>
                        <li><Link href={isHomePage ? "#links" : "/#links"} legacyBehavior><a onClick={handleLinkClick}>LINKS</a></Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}