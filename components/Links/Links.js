// components/Links/Links.js
import Link from 'next/link';
import { FaGlobe, FaTwitter, FaInstagram, FaYoutube, FaBuilding, FaMicrophone } from 'react-icons/fa';

export default function Links() {
    return (
        <section className="links-section" id="links">
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
                                <a href="https://twitter.com/takuya_satou" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaTwitter size={22} />
                                    </div>
                                    <span className="link-text">X (Twitter)</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://www.instagram.com/takuyasatou_official/" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaInstagram size={22} />
                                    </div>
                                    <span className="link-text">Instagram</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://www.youtube.com/channel/UC3dCF3VC5X6FjlxeLU2rmLA" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <FaYoutube size={22} />
                                    </div>
                                    <span className="link-text">YouTube</span>
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
                                <a href="https://www.scatbabysshow.com/" target="_blank" rel="noopener noreferrer">
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
}