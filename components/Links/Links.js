// components/Links/Links.js
import Link from 'next/link';
import { forwardRef, useRef } from 'react';
import { FaGlobe, FaTwitter, FaInstagram, FaYoutube, FaBuilding, FaMicrophone } from 'react-icons/fa';

const Links = forwardRef((props, ref) => {
    const linksRef = useRef(null);

    return (
        <section className="links-section" id="links" ref={ref || linksRef}>
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">LINKS</h2>
                    <p className="section-subtitle">公式リンク</p>
                </div>
                <div className="links-container">
                    <div className="links-category">
                        <h3 className="links-title">公式サイト</h3>
                        <ul className="links-list">
                            <li className="links-item">
                                <a href="https://www.kenproduction.co.jp/talent/39" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaGlobe size={22} />
                                    </div>
                                    <span className="link-text">佐藤拓也 公式プロフィール（賢プロダクション）</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="links-category">
                        <h3 className="links-title">SNS</h3>
                        <ul className="links-list">
                            <li className="links-item">
                                <a href="https://x.com/5takuya5" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaTwitter size={22} />
                                    </div>
                                    <span className="link-text">X (Twitter)</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://www.instagram.com/takuya.voices/" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaInstagram size={22} />
                                    </div>
                                    <span className="link-text">Instagram</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://www.youtube.com/playlist?list=PLyKSHZQWec5FoQ2WeZS4_HWkO_9TuUAP9" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaYoutube size={22} />
                                    </div>
                                    <span className="link-text">YouTube - 佐藤サン、もう1杯</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="links-category">
                        <h3 className="links-title">関連サイト</h3>
                        <ul className="links-list">
                            <li className="links-item">
                                <a href="https://www.kenproduction.co.jp/" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaBuilding size={22} />
                                    </div>
                                    <span className="link-text">賢プロダクション公式サイト</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://ch.nicovideo.jp/sukebe" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaMicrophone size={22} />
                                    </div>
                                    <span className="link-text">羽多野渉・佐藤拓也のScat Babys Show!!</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
});

Links.displayName = 'Links';

export default Links;