import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Birthday from '../components/Birthday/Birthday';
import OnAir from '../components/OnAir/OnAir';
import Schedule from '../components/Schedule/Schedule';
import Works from '../components/Works/Works';
import VideoSection from '../components/Video/VideoSection';
import Links from '../components/Links/Links';

export default function Home() {
  const [birthdays, setBirthdays] = useState([]);
  const [onAirContent, setOnAirContent] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [works, setWorks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetchStatus, setDataFetchStatus] = useState({
    birthdays: false,
    onAir: false,
    schedules: false,
    works: false,
    videos: false
  });

  // データのフェッチを実行
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // データ取得用の関数
        const fetchDataWithTimeout = async (url, dataType, timeout = 10000) => {
          try {
            // タイムアウト処理を追加
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`${dataType}データの取得に失敗しました: ${response.status}`);
            const data = await response.json();
            console.log(`${dataType}データ:`, data);
            return { success: true, data };
          } catch (err) {
            console.error(`${dataType}データの取得エラー:`, err);
            return { success: false, error: err.message };
          }
        };

        // 誕生日キャラクターの取得
        const birthdaysResult = await fetchDataWithTimeout('/api/birthdays', '誕生日');
        if (birthdaysResult.success) {
          setBirthdays(birthdaysResult.data);
        }
        setDataFetchStatus(prev => ({ ...prev, birthdays: true }));

        // 放送中コンテンツの取得
        const onAirResult = await fetchDataWithTimeout('/api/on-air', '放送中コンテンツ');
        if (onAirResult.success) {
          setOnAirContent(onAirResult.data);
        }
        setDataFetchStatus(prev => ({ ...prev, onAir: true }));

        // スケジュールの取得
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);

        // ISO形式に変換して日付パラメータを作成
        const fromParam = today.toISOString().split('T')[0];
        const toParam = thirtyDaysLater.toISOString().split('T')[0];

        const schedulesResult = await fetchDataWithTimeout(
          `/api/schedules?from=${fromParam}&to=${toParam}`,
          'スケジュール'
        );
        if (schedulesResult.success) {
          setSchedules(schedulesResult.data);
        }
        setDataFetchStatus(prev => ({ ...prev, schedules: true }));

        // 作品データの取得
        const worksResult = await fetchDataWithTimeout('/api/works', '作品');
        if (worksResult.success) {
          setWorks(worksResult.data);
        }
        setDataFetchStatus(prev => ({ ...prev, works: true }));

        // 動画データの取得
        const videosResult = await fetchDataWithTimeout('/api/videos', '動画');
        if (videosResult.success) {
          setVideos(videosResult.data);
        }
        setDataFetchStatus(prev => ({ ...prev, videos: true }));

        // すべてのデータ取得が完了するか、5秒経過したらローディングを終了
        setTimeout(() => {
          setLoading(false);
        }, 5000);
      } catch (err) {
        console.error('データの取得エラー:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    // いかなる場合も10秒後にはローディングを強制終了
    const forceLoadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('タイムアウトによりローディングを強制終了します');
        setLoading(false);
      }
    }, 10000);

    return () => clearTimeout(forceLoadingTimeout);
  }, []);

  // データ取得状況をコンソールに表示
  useEffect(() => {
    console.log("データ取得状況:", dataFetchStatus);

    // すべてのデータ取得が完了したらローディングを終了
    const allDataFetched = Object.values(dataFetchStatus).every(status => status === true);
    if (allDataFetched) {
      setLoading(false);
    }
  }, [dataFetchStatus]);

  // エラー表示
  if (error) {
    console.warn('データ取得エラーがありますが、フォールバックデータを使用して表示します:', error);
  }

  return (
    <Layout title="佐藤拓也ファンサイト - 声優・佐藤拓也さんの出演作品、スケジュール情報など">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>データを読み込んでいます...</p>
        </div>
      ) : (
        <>
          <Birthday characters={birthdays} />
          <OnAir content={onAirContent} />
          <Schedule schedules={schedules} />
          <Works works={works} />
          <VideoSection videos={videos} />
          <Links />
        </>
      )}
    </Layout>
  );
}