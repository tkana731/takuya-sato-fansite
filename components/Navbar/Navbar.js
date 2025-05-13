// components/Navbar/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // トグルボタンのクリックハンドラ
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        // メニュー開閉時にbodyのスクロールを制御
        document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
    };

    // リンクのクリックでメニューを閉じる
    const handleLinkClick = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
    };

    // ESCキーでメニューを閉じる
    useEffect(() => {
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
                        佐藤拓也<span>Voice Actor Fan Site</span>
                    </Link>
                </div>

                {/* デスクトップ用ナビゲーション - header-containerの中に配置 */}
                <nav className="desktop-nav">
                    <ul className="nav-menu">
                        <li><Link href="/" className="active">HOME</Link></li>
                        <li><Link href="#schedule">SCHEDULE</Link></li>
                        <li><Link href="#works">WORKS</Link></li>
                        <li><Link href="#">DISCOGRAPHY</Link></li>
                        <li><Link href="#video">VIDEO</Link></li>
                        <li><Link href="#links">LINKS</Link></li>
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
                        <li><Link href="/" onClick={handleLinkClick}>HOME</Link></li>
                        <li><Link href="#schedule" onClick={handleLinkClick}>SCHEDULE</Link></li>
                        <li><Link href="#works" onClick={handleLinkClick}>WORKS</Link></li>
                        <li><Link href="#" onClick={handleLinkClick}>DISCOGRAPHY</Link></li>
                        <li><Link href="#video" onClick={handleLinkClick}>VIDEO</Link></li>
                        <li><Link href="#links" onClick={handleLinkClick}>LINKS</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}