// components/Works/Works.js
import { useState } from 'react';

export default function Works({ works = [] }) {
    const [activeTab, setActiveTab] = useState('anime');

    // タブ切り替え処理
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // APIから取得したデータがない場合のフォールバックデータ
    const fallbackWorks = {
        anime: [
            { id: '1', title: '完璧すぎて可愛げがないと婚約破棄された聖女は隣国に売られる', role: 'オスヴァルト・パルナコルタ 役', year: '2025年' },
            { id: '2', title: 'クラシック★スターズ', role: 'ロスト・ヴィヴァルディ 役', year: '2025年' },
            { id: '3', title: 'FARMAGIA', role: 'アンザー/ザナス 役', year: '2025年' },
            { id: '4', title: 'Unnamed Memory Act.2', role: 'アルス 役', year: '2025年' },
            { id: '5', title: 'デリコズ・ナーサリー', role: 'ディーノ・クラシコ 役', year: '2024年' },
            { id: '6', title: '新米オッサン冒険者、最強パーティに死ぬほど鍛えられて無敵になる。', role: 'リック・グラディアートル 役', isMain: true, year: '2024年' },
            { id: '7', title: 'Unnamed Memory', role: 'アルス 役', year: '2024年' },
            { id: '8', title: 'Re:Monster', role: 'ゴブ朗 役', year: '2024年' }
        ],
        game: [
            { id: '9', title: 'テイルズ オブ アライズ', role: 'アルフェン 役', isMain: true },
            { id: '10', title: 'アサシン クリード ローグ', role: 'シェイ・パトリック・コーマック 役', isMain: true },
            { id: '11', title: 'アガレスト戦記2', role: 'ヴァイス 役', isMain: true },
            { id: '12', title: 'アイドリッシュセブン', role: '十龍之介 役' },
            { id: '13', title: 'アンジェリーク ルミナライズ', role: 'シュリ 役' },
            { id: '14', title: 'Rise of the Ronin', role: '伊庭八郎 役' },
            { id: '15', title: 'スターオーシャン 6 THE DIVINE FORCE', role: 'テオ・クレムラート 役' },
            { id: '16', title: '刀剣乱舞', role: '燭台切光忠/江雪左文字 役' }
        ],
        dub: {
            movie: [
                { id: '17', title: 'ジェントルメン', role: 'レイ（チャーリー・ハナム） 役' },
                { id: '18', title: 'Marvel パニッシャー', role: 'ビリー・ルッソ（ベン・バーンズ） 役' },
                { id: '19', title: 'アザーズ-捕食者', role: 'ゲイツ（リッチ・マクドナルド） 役', isMain: true },
                { id: '20', title: 'マジック・マイク', role: 'アダム（アレックス・ペティファー） 役' }
            ],
            drama: [
                { id: '21', title: 'SEAL Team/シール・チーム', role: 'クレイ・スペンサー(マックス・シエリオット) 役' },
                { id: '22', title: 'トラウマコード', role: 'ヤン・ジェウォン（チュ・ヨンウ） 役' },
                { id: '23', title: 'DOC(ドック) あすへのカルテ', role: 'ロレンツォ・ラッザリーニ（ジャンマルコ・サウリーノ） 役' },
                { id: '24', title: 'コード・ブラック 生と死の間で', role: 'マリオ・サヴェッティ（ベンジャミン・ホリングスワース） 役' }
            ]
        },
        other: {
            narration: [
                { id: '25', title: '『ドラゴンズドグマ オンライン』ゲーム解説プロモーションムービー', year: '2015年' },
                { id: '26', title: '京都国立博物館特別展覧会 琳派誕生400年記念 琳派 京（みやこ）を彩る', role: '音声ガイドナレーション', year: '2015年' },
                { id: '27', title: '『驚異の惑星：溶岩と地球』', role: 'ナショナル ジオグラフィック (TV)', year: '2019年' }
            ],
            radio: [
                { id: '28', title: '羽多野渉・佐藤拓也のScat Babys Show!!', year: '2016年～' },
                { id: '29', title: '佐藤拓也のちょっとやってみて!!', year: '2019年～' },
                { id: '30', title: '佐藤拓也&堀江瞬 アニメみたいに!', year: '2021年～' },
                { id: '31', title: '中澤まさとも・佐藤拓也の胸キュンラボ from 100シーンの恋＋', year: '2021年～' }
            ]
        }
    };

    return (
        <section className="works-section" id="works">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">WORKS</h2>
                    <p className="section-subtitle">出演作品</p>
                    <a href="#" className="view-all">VIEW ALL</a>
                </div>

                <div className="works-tabs">
                    <div className="works-tabs-container">
                        <button
                            className={`works-tab ${activeTab === 'anime' ? 'active' : ''}`}
                            onClick={() => handleTabChange('anime')}
                        >
                            アニメ
                        </button>
                        <button
                            className={`works-tab ${activeTab === 'game' ? 'active' : ''}`}
                            onClick={() => handleTabChange('game')}
                        >
                            ゲーム
                        </button>
                        <button
                            className={`works-tab ${activeTab === 'dub' ? 'active' : ''}`}
                            onClick={() => handleTabChange('dub')}
                        >
                            吹き替え
                        </button>
                        <button
                            className={`works-tab ${activeTab === 'other' ? 'active' : ''}`}
                            onClick={() => handleTabChange('other')}
                        >
                            その他
                        </button>
                    </div>
                </div>

                <div id="anime-content" className={`works-content ${activeTab === 'anime' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">アニメ出演作品一覧</h3>
                        <ul className="list-items">
                            {fallbackWorks.anime.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    <span className="item-year">{item.year}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div id="game-content" className={`works-content ${activeTab === 'game' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">ゲーム出演作品一覧</h3>
                        <ul className="list-items">
                            {fallbackWorks.game.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div id="dub-content" className={`works-content ${activeTab === 'dub' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">海外映画吹き替え</h3>
                        <ul className="list-items">
                            {fallbackWorks.dub.movie.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>

                        <h3 className="list-title">海外ドラマ吹き替え</h3>
                        <ul className="list-items">
                            {fallbackWorks.dub.drama.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    <span className={`item-role ${item.isMain ? 'main' : ''}`}>{item.role}</span>
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div id="other-content" className={`works-content ${activeTab === 'other' ? 'active' : ''}`}>
                    <div className="works-list">
                        <h3 className="list-title">ナレーション</h3>
                        <ul className="list-items">
                            {fallbackWorks.other.narration.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.role && <span className="item-role">{item.role}</span>}
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>

                        <h3 className="list-title">ラジオ・ネット配信番組</h3>
                        <ul className="list-items">
                            {fallbackWorks.other.radio.map(item => (
                                <li className="list-item" key={item.id}>
                                    <span className="item-title">{item.title}</span>
                                    {item.role && <span className="item-role">{item.role}</span>}
                                    {item.year && <span className="item-year">{item.year}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}