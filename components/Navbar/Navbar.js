// components/Navbar/Navbar.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="メニューを開く"
                >
                    ☰
                </button>
                <nav className="nav">
                    <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link href="/" className="active">HOME</Link></li>
                        <li><Link href="#schedule">SCHEDULE</Link></li>
                        <li><Link href="#works">WORKS</Link></li>
                        <li><Link href="#">DISCOGRAPHY</Link></li>
                        <li><Link href="#video">VIDEO</Link></li>
                        <li><Link href="#links">LINKS</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}