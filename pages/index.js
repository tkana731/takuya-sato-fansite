// pages/index.js
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

  // データのフェッチを試みる (API完成後に実装)
  useEffect(() => {
    // ここでAPIからデータを取得する処理を書く
    // APIが未完成の場合、各コンポーネントのフォールバックデータが使用される
  }, []);

  return (
    <Layout title="佐藤拓也ファンサイト - 声優・佐藤拓也さんの出演作品、スケジュール情報など">
      <Birthday characters={birthdays} />
      <OnAir content={onAirContent} />
      <Schedule schedules={schedules} />
      <Works works={works} />
      <VideoSection videos={videos} />
      <Links />
    </Layout>
  );
}