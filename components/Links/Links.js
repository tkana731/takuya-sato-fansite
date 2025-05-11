// components/Links/Links.js
import Link from 'next/link';

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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z" />
                                        </svg>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </div>
                                    <span className="link-text">X (Twitter)</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://www.instagram.com/takuyasatou_official/" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </div>
                                    <span className="link-text">Instagram</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://www.youtube.com/channel/UC3dCF3VC5X6FjlxeLU2rmLA" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                                        </svg>
                                    </div>
                                    <span className="link-text">賢プロダクション公式サイト</span>
                                </a>
                            </li>
                            <li className="links-item">
                                <a href="https://www.scatbabysshow.com/" target="_blank" rel="noopener noreferrer">
                                    <div className="link-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 1.99 2H8v-2H4V8c0-.05.02-.1.02-.15l-1-2v.15H3l.24 1zM11 2v2h8c1.1 0 2 .9 2 2v2.55c-.59-.34-1.27-.55-2-.55h-8v2h6v2h-2v2h2v2h-2v4h6c1.1 0 2-.9 2-2v-2.45c.72-.25 1.36-.67 1.84-1.21.19-.21.33-.46.46-.71.1-.18.19-.36.25-.55.14-.38.21-.78.21-1.18V8c0-1.1-.9-2-2-2h-8V2h-2zm10 16h-5v-1h5c.55 0 1 .45 1 1s-.45 1-1 1z" />
                                        </svg>
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