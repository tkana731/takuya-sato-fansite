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

export default function Home() {
  // データ状態
  const [birthdays, setBirthdays] = useState([]);
  const [onAirContent, setOnAirContent] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [works, setWorks] = useState({
    anime: [],
    game: [],
    dub: {
      movie: [],
      drama: [],
      anime: []
    },
    other: {
      special: [],
      drama: [],
      radio: [],
      voice: [],
      comic: []
    }
  });
  const [videos, setVideos] = useState([]);

  // UI状態
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    birthdays: false,
    onAir: false,
    schedules: false,
    works: false,
    videos: false
  });

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
  }, [router.isReady, loading, router.asPath]);

  // データのフェッチを実行
  useEffect(() => {
    const fetchDataWithTimeout = async (url, dataType, timeout = 5000) => {
      try {
        // タイムアウト処理を追加
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`${dataType}データの取得に失敗しました: ${response.status}`);

        const data = await response.json();
        return { success: true, data };
      } catch (err) {
        console.error(`${dataType}データの取得エラー:`, err);
        return { success: false, error: err.message };
      }
    };

    // データを並列に取得
    const fetchAllData = async () => {
      // 日付パラメータの準備
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      const fromParam = today.toISOString().split('T')[0];
      const toParam = thirtyDaysLater.toISOString().split('T')[0];

      try {
        const [birthdaysResult, onAirResult, schedulesResult, videosResult, worksResult] = await Promise.allSettled([
          fetchDataWithTimeout('/api/birthdays', 'birthdays'),
          fetchDataWithTimeout('/api/on-air', 'onAir'),
          fetchDataWithTimeout(`/api/schedules?from=${fromParam}&to=${toParam}`, 'schedules'),
          fetchDataWithTimeout('/api/videos', 'videos'),
          fetchDataWithTimeout('/api/works', 'works')
        ]);

        // 結果を処理
        if (birthdaysResult.value?.success) {
          setBirthdays(birthdaysResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, birthdays: true }));

        if (onAirResult.value?.success) {
          setOnAirContent(onAirResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, onAir: true }));

        if (schedulesResult.value?.success) {
          setSchedules(schedulesResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, schedules: true }));

        if (videosResult.value?.success) {
          setVideos(videosResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, videos: true }));

        if (worksResult.value?.success) {
          setWorks(worksResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, works: true }));

      } catch (error) {
        console.error('データ取得中のエラー:', error);
        // エラーが発生した場合でも、ローディングを終了
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 全データがロードされたかチェック
  useEffect(() => {
    if (dataLoaded.birthdays && dataLoaded.onAir && dataLoaded.schedules && dataLoaded.works && dataLoaded.videos) {
      // 全データがロードされたらローディングを終了
      setLoading(false);
    }
  }, [dataLoaded]);

  // 各セクションの表示判定用
  const hasData = {
    birthdays: birthdays && birthdays.length > 0,
    onAir: onAirContent && (onAirContent.anime?.length > 0 || onAirContent.radio?.length > 0 || onAirContent.web?.length > 0),
    schedules: schedules && schedules.schedules && schedules.schedules.length > 0,
    works: works && (works.anime?.length > 0 || works.game?.length > 0),
    videos: videos && videos.length > 0
  };

  return (
    <Layout title="佐藤拓也（声優）非公式ファンサイト - 出演作品・最新情報まとめ">
      <SEO
        title="佐藤拓也（声優）非公式ファンサイト - 出演作品・最新情報まとめ"
        description="声優・佐藤拓也（さとう たくや）の出演作品、スケジュール、最新情報を掲載。アイドリッシュセブン十龍之介役、キャプテン翼日向小次郎役など代表作多数。アニメ・ゲーム・吹き替え情報を網羅。"
        keywords="佐藤拓也,さとう たくや,声優,アイドリッシュセブン,十龍之介,キャプテン翼,日向小次郎,賢プロダクション,キャラ"
        type="website"
      />
      <SchemaOrg type="WebSite" />
      <SchemaOrg type="Person" />

      <div ref={homeRef}>
        {loading ? (
          <div className="loading-container">
            <div className="audio-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="loading-text">LOADING...</p>
          </div>
        ) : (
          <>
            {/* ヒーローセクション（最初に表示） */}
            <Hero />

            {/* 誕生日キャラクター */}
            {hasData.birthdays && <Birthday characters={birthdays} />}

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

            {/* リンク - 静的データなので常に表示 */}
            <div id="links" ref={(ref) => registerSectionRef('links', ref)}>
              <Links />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}