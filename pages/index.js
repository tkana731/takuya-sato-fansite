import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Birthday from '../components/Birthday/Birthday';
import OnAir from '../components/OnAir/OnAir';
import Schedule from '../components/Schedule/Schedule';
import Works from '../components/Works/Works';
import VideoSection from '../components/Video/VideoSection';
import Links from '../components/Links/Links';
import SkeletonUI from '../components/Loading/SkeletonUI';

export default function Home() {
  // データ状態
  const [birthdays, setBirthdays] = useState([]);
  const [onAirContent, setOnAirContent] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [works, setWorks] = useState([]);
  const [videos, setVideos] = useState([]);

  // UI状態
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataState, setDataState] = useState({
    birthdays: { loaded: false, loading: true },
    onAir: { loaded: false, loading: true },
    schedules: { loaded: false, loading: true },
    works: { loaded: false, loading: true },
    videos: { loaded: false, loading: true }
  });

  // データのフェッチを実行
  useEffect(() => {
    const fetchDataWithTimeout = async (url, dataType, timeout = 5000) => {
      try {
        // タイムアウト処理を追加
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        setDataState(prev => ({
          ...prev,
          [dataType]: { ...prev[dataType], loading: true }
        }));

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`${dataType}データの取得に失敗しました: ${response.status}`);

        const data = await response.json();
        return { success: true, data };
      } catch (err) {
        console.error(`${dataType}データの取得エラー:`, err);
        return { success: false, error: err.message };
      } finally {
        setDataState(prev => ({
          ...prev,
          [dataType]: { ...prev[dataType], loading: false }
        }));
      }
    };

    // すべてのデータを並列に取得
    const fetchAllData = async () => {
      // 初期ローディング状態
      setInitialLoading(true);

      // 日付パラメータの準備
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      const fromParam = today.toISOString().split('T')[0];
      const toParam = thirtyDaysLater.toISOString().split('T')[0];

      // 初期ローディングを1秒後に解除（少なくともスケルトンUIを表示するため）
      setTimeout(() => {
        setInitialLoading(false);
      }, 1000);

      // 並列にデータを取得
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
          setDataState(prev => ({
            ...prev,
            birthdays: { loaded: true, loading: false }
          }));
        }

        if (onAirResult.value?.success) {
          setOnAirContent(onAirResult.value.data);
          setDataState(prev => ({
            ...prev,
            onAir: { loaded: true, loading: false }
          }));
        }

        if (schedulesResult.value?.success) {
          setSchedules(schedulesResult.value.data);
          setDataState(prev => ({
            ...prev,
            schedules: { loaded: true, loading: false }
          }));
        }

        if (worksResult.value?.success) {
          setWorks(worksResult.value.data);
          setDataState(prev => ({
            ...prev,
            works: { loaded: true, loading: false }
          }));
        }

        if (videosResult.value?.success) {
          setVideos(videosResult.value.data);
          setDataState(prev => ({
            ...prev,
            videos: { loaded: true, loading: false }
          }));
        }
      } catch (error) {
        console.error('データ取得中のエラー:', error);
      }
    };

    fetchAllData();
  }, []);

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
      {initialLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>データを読み込んでいます...</p>
        </div>
      ) : (
        <>
          {/* 誕生日キャラクター */}
          {dataState.birthdays.loaded && hasData.birthdays && <Birthday characters={birthdays} />}

          {/* 放送中コンテンツ */}
          {dataState.onAir.loading ? (
            <SkeletonUI type="default" count={3} />
          ) : (
            dataState.onAir.loaded && <OnAir content={onAirContent} />
          )}

          {/* スケジュール */}
          {dataState.schedules.loading ? (
            <SkeletonUI type="schedule" count={3} />
          ) : (
            dataState.schedules.loaded && <Schedule schedules={schedules} />
          )}

          {/* 作品 */}
          {dataState.works.loading ? (
            <SkeletonUI type="works" count={5} />
          ) : (
            dataState.works.loaded && <Works works={works} />
          )}

          {/* 動画 */}
          {dataState.videos.loading ? (
            <SkeletonUI type="video" count={3} />
          ) : (
            dataState.videos.loaded && <VideoSection videos={videos} />
          )}

          {/* リンク - 静的データなので常に表示 */}
          <Links />
        </>
      )}
    </Layout>
  );
}