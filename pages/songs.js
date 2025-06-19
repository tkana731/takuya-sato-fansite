import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';

export default function SongsPage({ songData }) {
  const [activeTab, setActiveTab] = useState('character');

  // タブ切り替え処理
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 楽曲タイプの日本語表示
  const getSongTypeLabel = (type) => {
    const typeLabels = {
      'op': 'オープニング',
      'ed': 'エンディング',
      'insert': '挿入歌',
      'character': 'キャラクターソング',
      'theme': 'テーマソング',
      'solo': 'ソロ楽曲',
      'duet': 'デュエット',
      'group': 'グループ楽曲',
      'cover': 'カバー楽曲',
      'original': 'オリジナル楽曲'
    };
    return typeLabels[type] || type;
  };

  // メタデータの生成
  const generateMetadata = () => {
    const tabNames = {
      character: 'キャラクターソング',
      personal: '本人名義楽曲'
    };

    const currentTabName = tabNames[activeTab] || 'キャラクターソング';
    const title = `佐藤拓也さん 楽曲一覧 - ${currentTabName} | 非公式ファンサイト`;
    const description = `声優・佐藤拓也さんの${currentTabName}を一覧で掲載。作詞・作曲・編曲者などの詳細情報をまとめています。`;

    return { title, description };
  };

  // 構造化データの生成
  const generateSchemaData = () => {
    let currentSongs = [];

    if (activeTab === 'character') {
      currentSongs = songData?.character?.songs || [];
    } else if (activeTab === 'personal') {
      currentSongs = songData?.personal?.songs || [];
    }

    if (currentSongs.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `佐藤拓也さん 楽曲一覧 - ${generateMetadata().title.split(' - ')[1].split(' |')[0]}`,
      description: generateMetadata().description,
      numberOfItems: currentSongs.length,
      itemListElement: currentSongs.slice(0, 10).map((song, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MusicRecording',
          name: song.title,
          description: song.description || `佐藤拓也さんが歌唱した楽曲`,
          performer: {
            '@type': 'Person',
            name: song.artist || '佐藤拓也'
          },
          composer: song.composer ? {
            '@type': 'Person',
            name: song.composer
          } : undefined,
          lyricist: song.lyricist ? {
            '@type': 'Person',
            name: song.lyricist
          } : undefined,
          datePublished: song.releaseDate,
          genre: getSongTypeLabel(song.songType)
        }
      }))
    };
  };

  const { title: pageTitle, description: pageDescription } = generateMetadata();

  return (
    <Layout>
      <SEO 
        title={pageTitle}
        description={pageDescription}
        type="article"
      />
      {generateSchemaData() && (
        <SchemaOrg
          type="MusicRecording"
          data={generateSchemaData()}
        />
      )}

      <section className="works-page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">SONGS</h1>
            <p className="section-subtitle">楽曲一覧</p>
          </div>

          {/* カテゴリタブ - worksページと同じ構造 */}
          <div className="works-tabs">
            <div className="works-tabs-container">
              <button
                className={`works-tab ${activeTab === 'character' ? 'active' : ''}`}
                onClick={() => handleTabChange('character')}
              >
                キャラクターソング
              </button>
              <button
                className={`works-tab ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => handleTabChange('personal')}
              >
                本人名義楽曲
              </button>
            </div>
          </div>

          <>
            {/* キャラクターソングタブ */}
            <div id="character-content" className={`works-content ${activeTab === 'character' ? 'active' : ''}`}>
              <div className="works-list">
                <h3 className="list-title">キャラクターソング一覧</h3>
                <ul className="list-items">
                  {songData?.character?.songs && songData.character.songs.map(song => (
                    <li className="list-item" key={song.id}>
                      <span className="item-title">{song.title}</span>
                      {song.artist && song.artist !== 'artist' && (
                        <span className="item-role">{song.artist}</span>
                      )}
                      {song.releaseYear && <span className="item-year">{song.releaseYear}年</span>}
                      {song.lyricist && (
                        <span className="item-detail">作詞: {song.lyricist}</span>
                      )}
                      {song.composer && (
                        <span className="item-detail">作曲: {song.composer}</span>
                      )}
                      {song.arranger && (
                        <span className="item-detail">編曲: {song.arranger}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {(!songData?.character?.songs || songData.character.songs.length === 0) && (
                  <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                )}
              </div>
            </div>

            {/* 本人名義楽曲タブ */}
            <div id="personal-content" className={`works-content ${activeTab === 'personal' ? 'active' : ''}`}>
              <div className="works-list">
                <h3 className="list-title">本人名義楽曲一覧</h3>
                <ul className="list-items">
                  {songData?.personal?.songs && songData.personal.songs.map(song => (
                    <li className="list-item" key={song.id}>
                      <span className="item-title">{song.title}</span>
                      {song.artist && song.artist !== 'artist' && (
                        <span className="item-role">{song.artist}</span>
                      )}
                      {song.releaseYear && <span className="item-year">{song.releaseYear}年</span>}
                      {song.lyricist && (
                        <span className="item-detail">作詞: {song.lyricist}</span>
                      )}
                      {song.composer && (
                        <span className="item-detail">作曲: {song.composer}</span>
                      )}
                      {song.arranger && (
                        <span className="item-detail">編曲: {song.arranger}</span>
                      )}
                    </li>
                  ))}
                </ul>
                {(!songData?.personal?.songs || songData.personal.songs.length === 0) && (
                  <p className="text-center text-gray-600 mt-4">現在データがありません</p>
                )}
              </div>
            </div>
          </>
        </div>
      </section>
    </Layout>
  );
}

// SSG (Static Site Generation) の実装
export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/songs`);
    
    if (!response.ok) {
      throw new Error('Songs data fetch failed');
    }
    
    const songData = await response.json();
    
    return {
      props: {
        songData
      },
      revalidate: 3600 // 1時間ごとに再生成
    };
  } catch (error) {
    console.error('Static props generation error:', error);
    
    // エラー時のフォールバック
    return {
      props: {
        songData: {
          character: {
            songs: [],
            stats: {
              totalSongs: 0,
              songTypeStats: {},
              releaseYearStats: {},
              availableYears: [],
              availableSongTypes: []
            }
          },
          personal: {
            songs: [],
            stats: {
              totalSongs: 0,
              songTypeStats: {},
              releaseYearStats: {},
              availableYears: [],
              availableSongTypes: []
            }
          },
          overall: {
            totalSongs: 0,
            characterSongs: 0,
            personalSongs: 0
          }
        }
      },
      revalidate: 300 // エラー時は5分後に再試行
    };
  }
}