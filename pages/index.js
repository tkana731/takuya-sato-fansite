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

  // データのフェッチを実行
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 誕生日キャラクターの取得
        const birthdaysRes = await fetch('/api/birthdays');
        if (!birthdaysRes.ok) throw new Error('誕生日データの取得に失敗しました');
        const birthdaysData = await birthdaysRes.json();
        setBirthdays(birthdaysData);

        // 放送中コンテンツの取得
        const onAirRes = await fetch('/api/on-air');
        if (!onAirRes.ok) throw new Error('放送中コンテンツデータの取得に失敗しました');
        const onAirData = await onAirRes.json();
        setOnAirContent(onAirData);

        // スケジュールの取得
        const schedulesRes = await fetch('/api/schedules');
        if (!schedulesRes.ok) throw new Error('スケジュールデータの取得に失敗しました');
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData);

        // 作品データの取得
        const worksRes = await fetch('/api/works');
        if (!worksRes.ok) throw new Error('作品データの取得に失敗しました');
        const worksData = await worksRes.json();
        setWorks(worksData);

        // 動画データの取得
        const videosRes = await fetch('/api/videos');
        if (!videosRes.ok) throw new Error('動画データの取得に失敗しました');
        const videosData = await videosRes.json();
        setVideos(videosData);

        setLoading(false);
      } catch (err) {
        console.error('データの取得エラー:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // エラー表示
  if (error) {
    console.warn('データ取得エラーがありますが、フォールバックデータを使用して表示します:', error);
    // エラーがあってもフォールバックデータでレンダリングするため、ここでは何も表示しない
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