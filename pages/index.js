import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
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
  const [works, setWorks] = useState([]);
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

    // すべてのデータを並列に取得
    const fetchAllData = async () => {
      // 日付パラメータの準備
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      const fromParam = today.toISOString().split('T')[0];
      const toParam = thirtyDaysLater.toISOString().split('T')[0];

      try {
        const [birthdaysResult, onAirResult, schedulesResult, worksResult, videosResult] = await Promise.allSettled([
          fetchDataWithTimeout('/api/birthdays', 'birthdays'),
          fetchDataWithTimeout('/api/on-air', 'onAir'),
          fetchDataWithTimeout(`/api/schedules?from=${fromParam}&to=${toParam}`, 'schedules'),
          fetchDataWithTimeout('/api/works', 'works'),
          fetchDataWithTimeout('/api/videos', 'videos')
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

        if (worksResult.value?.success) {
          setWorks(worksResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, works: true }));

        if (videosResult.value?.success) {
          setVideos(videosResult.value.data);
        }
        setDataLoaded(prev => ({ ...prev, videos: true }));
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
    <Layout title="佐藤拓也ファンサイト - 声優・佐藤拓也さんの出演作品、スケジュール情報など">
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
          {/* 誕生日キャラクター */}
          {hasData.birthdays && <Birthday characters={birthdays} />}

          {/* 放送中コンテンツ */}
          <OnAir content={onAirContent} />

          {/* スケジュール */}
          <Schedule schedules={schedules} />

          {/* 作品 */}
          <Works works={works} />

          {/* 動画 */}
          <VideoSection videos={videos} />

          {/* リンク - 静的データなので常に表示 */}
          <Links />
        </>
      )}
    </Layout>
  );
}