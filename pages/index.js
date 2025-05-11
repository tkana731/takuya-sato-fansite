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

        // 誕生日キャラクターの取得
        try {
          const birthdaysRes = await fetch('/api/birthdays');
          if (!birthdaysRes.ok) throw new Error(`誕生日データの取得に失敗しました: ${birthdaysRes.status}`);
          const birthdaysData = await birthdaysRes.json();
          console.log("誕生日データ:", birthdaysData);
          setBirthdays(birthdaysData);
          setDataFetchStatus(prev => ({ ...prev, birthdays: true }));
        } catch (err) {
          console.error('誕生日データの取得エラー:', err);
          setDataFetchStatus(prev => ({ ...prev, birthdays: false }));
        }

        // 放送中コンテンツの取得
        try {
          const onAirRes = await fetch('/api/on-air');
          if (!onAirRes.ok) throw new Error(`放送中コンテンツデータの取得に失敗しました: ${onAirRes.status}`);
          const onAirData = await onAirRes.json();
          console.log("放送中コンテンツデータ:", onAirData);
          setOnAirContent(onAirData);
          setDataFetchStatus(prev => ({ ...prev, onAir: true }));
        } catch (err) {
          console.error('放送中コンテンツデータの取得エラー:', err);
          setDataFetchStatus(prev => ({ ...prev, onAir: false }));
        }

        // スケジュールの取得
        try {
          // 現在の日付から30日間の範囲を指定してスケジュールを取得
          const today = new Date();
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(today.getDate() + 30);

          // ISO形式に変換して日付パラメータを作成
          const fromParam = today.toISOString().split('T')[0];
          const toParam = thirtyDaysLater.toISOString().split('T')[0];

          const schedulesRes = await fetch(`/api/schedules?from=${fromParam}&to=${toParam}`);
          if (!schedulesRes.ok) throw new Error(`スケジュールデータの取得に失敗しました: ${schedulesRes.status}`);
          const schedulesData = await schedulesRes.json();
          console.log("スケジュールデータ:", schedulesData);
          setSchedules(schedulesData);
          setDataFetchStatus(prev => ({ ...prev, schedules: true }));
        } catch (err) {
          console.error('スケジュールデータの取得エラー:', err);
          setDataFetchStatus(prev => ({ ...prev, schedules: false }));
        }

        // 作品データの取得
        try {
          const worksRes = await fetch('/api/works');
          if (!worksRes.ok) throw new Error(`作品データの取得に失敗しました: ${worksRes.status}`);
          const worksData = await worksRes.json();
          console.log("作品データ:", worksData);
          setWorks(worksData);
          setDataFetchStatus(prev => ({ ...prev, works: true }));
        } catch (err) {
          console.error('作品データの取得エラー:', err);
          setDataFetchStatus(prev => ({ ...prev, works: false }));
        }

        // 動画データの取得
        try {
          const videosRes = await fetch('/api/videos');
          if (!videosRes.ok) throw new Error(`動画データの取得に失敗しました: ${videosRes.status}`);
          const videosData = await videosRes.json();
          console.log("動画データ:", videosData);
          setVideos(videosData);
          setDataFetchStatus(prev => ({ ...prev, videos: true }));
        } catch (err) {
          console.error('動画データの取得エラー:', err);
          setDataFetchStatus(prev => ({ ...prev, videos: false }));
        }

        setLoading(false);
      } catch (err) {
        console.error('データの取得エラー:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // データ取得状況をコンソールに表示
  useEffect(() => {
    console.log("データ取得状況:", dataFetchStatus);
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