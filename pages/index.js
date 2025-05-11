import Layout from '../components/Layout/Layout';
import Birthday from '../components/Birthday/Birthday';
import OnAir from '../components/OnAir/OnAir';
import Schedule from '../components/Schedule/Schedule';
import Works from '../components/Works/Works';
import VideoSection from '../components/Video/VideoSection';
import Links from '../components/Links/Links';
import { useEffect, useState } from 'react';

export default function Home() {
  const [birthdays, setBirthdays] = useState([]);
  const [onAirContent, setOnAirContent] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [works, setWorks] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // データのフェッチ処理
    const fetchData = async () => {
      try {
        // 各種APIからデータを取得
        const birthdaysRes = await fetch('/api/birthdays');
        const birthdaysData = await birthdaysRes.json();
        setBirthdays(birthdaysData);

        // 同様に他のデータもフェッチ
        // ...
      } catch (error) {
        console.error('データの取得に失敗しました', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <Birthday characters={birthdays} />
      <OnAir content={onAirContent} />
      <Schedule schedules={schedules} />
      <Works works={works} />
      <VideoSection videos={videos} />
      <Links />
    </Layout>
  );
}