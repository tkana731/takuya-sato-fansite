// pages/index.js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import SEO from '../components/SEO/SEO';
import SchemaOrg from '../components/SEO/SchemaOrg';
import Hero from '../components/Hero/Hero'; // ヒーローセクションをインポート
import Birthday from '../components/Birthday/Birthday';
import OnAir from '../components/OnAir/OnAir';
import Schedule from '../components/Schedule/Schedule';
import Works from '../components/Works/Works';
import VideoSection from '../components/Video/VideoSection';
import Links from '../components/Links/Links';
import SocialPosts from '../components/SocialPosts/SocialPosts';
import Products from '../components/Products/Products';

export default function Home({ onAirContent, schedules, works, videos, socialPosts, products }) {
  // UI状態のみ（データは props から取得）
  const [loading] = useState(false);

  const router = useRouter();
  const homeRef = useRef(null);
  const sectionsRef = useRef({});

  // セクション参照を登録する関数
  const registerSectionRef = (id, ref) => {
    if (ref) {
      sectionsRef.current[id] = ref;
    }
  };

  // ハッシュに基づいてスクロール位置を調整する関数
  const scrollToHashSection = () => {
    if (!router.isReady || loading) return;

    const hash = window.location.hash;
    if (!hash) return;

    const sectionId = hash.substring(1); // #を削除

    // 少し遅延を与えて要素が完全に描画された後に実行
    setTimeout(() => {
      let element;

      // まず参照から要素を探す
      if (sectionsRef.current[sectionId]) {
        element = sectionsRef.current[sectionId];
      } else {
        // 参照がなければIDから探す
        element = document.getElementById(sectionId);
        if (!element) {
          // classからも探してみる
          const elements = document.getElementsByClassName(`${sectionId}-section`);
          if (elements.length > 0) {
            element = elements[0];
          }
        }
      }

      if (element) {
        // ヘッダーの高さを取得（余白なし）
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;

        // スクロール位置を計算
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementTop - headerHeight;

        // スクロール実行
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // 再調整は大幅なずれがある場合のみ行う
        setTimeout(() => {
          const newElementTop = element.getBoundingClientRect().top;
          if (Math.abs(newElementTop) > 80) { // 大幅なずれがある場合のみ再調整
            const newOffset = window.pageYOffset + newElementTop - headerHeight;
            window.scrollTo({
              top: newOffset,
              behavior: 'smooth'
            });
          }
        }, 800);
      }
    }, 500);
  };

  // ルート変更完了時に実行
  useEffect(() => {
    if (router.isReady && !loading) {
      scrollToHashSection();
    }
  }, [router.isReady, loading, router.asPath, scrollToHashSection]);

  // データはSSGで事前取得済みなので、ローディング関連のuseEffectは削除


  return (
    <Layout title="佐藤拓也さん非公式ファンサイト - 出演作品・最新情報まとめ">
      <SEO
        title="佐藤拓也さん非公式ファンサイト - 出演作品・最新情報まとめ"
        description="声優・佐藤拓也（さとう たくや）さんの出演作品、スケジュール、最新情報を掲載している非公式ファンサイトです。アイドリッシュセブン十龍之介役、キャプテン翼日向小次郎役など代表作多数。アニメ・ゲーム・吹き替え情報を網羅。"
        keywords="佐藤拓也,さとう たくや,声優,アイドリッシュセブン,十龍之介,キャプテン翼,日向小次郎,賢プロダクション,キャラ"
        type="website"
      />
      <SchemaOrg type="WebSite" />
      <SchemaOrg type="Person" />

      <div ref={homeRef}>
        <>
          {/* ヒーローセクション（最初に表示） */}
          <Hero />

          {/* 誕生日キャラクター */}
          <Birthday />

          {/* 放送中コンテンツ */}
          <OnAir content={onAirContent} />

          {/* スケジュール */}
          <div id="schedule" ref={(ref) => registerSectionRef('schedule', ref)}>
            <Schedule schedules={schedules} />
          </div>

          {/* 作品 */}
          <div id="works" ref={(ref) => registerSectionRef('works', ref)}>
            <Works works={works} />
          </div>

          {/* 動画 */}
          <VideoSection videos={videos} />

          {/* 商品 */}
          <div id="products" ref={(ref) => registerSectionRef('products', ref)}>
            <Products products={products} />
          </div>

          {/* ソーシャルメディア投稿 */}
          <div id="social-posts" ref={(ref) => registerSectionRef('social-posts', ref)}>
            <SocialPosts posts={socialPosts} limit={3} />
          </div>

          {/* リンク - 静的データなので常に表示 */}
          <div id="links" ref={(ref) => registerSectionRef('links', ref)}>
            <Links />
          </div>
        </>
      </div>
    </Layout>
  );
}

// SSG (Static Site Generation) の実装
export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // 日付パラメータの準備
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    const fromParam = today.toISOString().split('T')[0];
    const toParam = thirtyDaysLater.toISOString().split('T')[0];

    // 並列でデータを取得
    const [onAirRes, schedulesRes, videosRes, worksRes, socialPostsRes, productsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/on-air`),
      fetch(`${baseUrl}/api/schedules?from=${fromParam}&to=${toParam}`),
      fetch(`${baseUrl}/api/videos`),
      fetch(`${baseUrl}/api/works`),
      fetch(`${baseUrl}/api/social-posts`),
      fetch(`${baseUrl}/api/products?category=upcoming`)
    ]);

    // レスポンスをパース
    const onAirContent = onAirRes.status === 'fulfilled' && onAirRes.value.ok 
      ? await onAirRes.value.json() : [];
    const schedules = schedulesRes.status === 'fulfilled' && schedulesRes.value.ok 
      ? await schedulesRes.value.json() : [];
    const videos = videosRes.status === 'fulfilled' && videosRes.value.ok 
      ? await videosRes.value.json() : [];
    const works = worksRes.status === 'fulfilled' && worksRes.value.ok 
      ? await worksRes.value.json() : {
        anime: [],
        game: [],
        dub: { movie: [], drama: [], anime: [] },
        other: { special: [], drama: [], radio: [], voice: [], comic: [] }
      };
    const socialPosts = socialPostsRes.status === 'fulfilled' && socialPostsRes.value.ok 
      ? await socialPostsRes.value.json() : [];
    const products = productsRes.status === 'fulfilled' && productsRes.value.ok 
      ? await productsRes.value.json() : [];

    return {
      props: {
        onAirContent,
        schedules,
        works,
        videos,
        socialPosts,
        products
      },
      revalidate: 3600 // 1時間ごとに再生成
    };
  } catch (error) {
    console.error('Static props generation error:', error);
    
    // エラー時のフォールバック
    return {
      props: {
        onAirContent: [],
        schedules: [],
        works: {
          anime: [],
          game: [],
          dub: { movie: [], drama: [], anime: [] },
          other: { special: [], drama: [], radio: [], voice: [], comic: [] }
        },
        videos: [],
        socialPosts: [],
        products: []
      },
      revalidate: 300 // エラー時は5分後に再試行
    };
  }
}