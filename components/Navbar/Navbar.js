// components/Navbar/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // トグルボタンのクリックハンドラ
    const toggleMenu = (e) => {
        e.stopPropagation(); // イベントの伝播を防止
        setIsMenuOpen(prevState => !prevState);
    };

    // リンクのクリックでメニューを閉じる
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    // スクロール時にメニューを閉じる
    useEffect(() => {
        const handleScroll = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isMenuOpen]);

    // 画面外クリックでメニューを閉じる
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (isMenuOpen && !e.target.closest('.nav') && !e.target.closest('.nav-toggle')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
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
                <button
                    className="nav-toggle"
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
                >
                    {isMenuOpen ? "✕" : "☰"}
                </button>
                <nav className="nav">
                    <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link href="/" className="active" onClick={handleLinkClick}>HOME</Link></li>
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