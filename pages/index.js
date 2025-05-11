import Layout from '../components/Layout/Layout';
import Birthday from '../components/Birthday/Birthday';
import OnAir from '../components/OnAir/OnAir';
import Schedule from '../components/Schedule/Schedule';
import Works from '../components/Works/Works';
import VideoSection from '../components/Video/VideoSection';
import Links from '../components/Links/Links';
import prisma from '../lib/prisma';

// Date オブジェクトを JSON シリアライズ可能な形式に変換する関数
function serializeData(data) {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Date オブジェクトをISO文字列に変換
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));
}

export default function Home({ birthdaysData, onAirData, schedulesData, worksData, videosData }) {
  return (
    <Layout title="佐藤拓也ファンサイト - 声優・佐藤拓也さんの出演作品、スケジュール情報など">
      <Birthday characters={birthdaysData} />
      <OnAir content={onAirData} />
      <Schedule schedules={schedulesData} />
      <Works works={worksData} />
      <VideoSection videos={videosData} />
      <Links />
    </Layout>
  );
}

// サーバーサイドでデータを取得
export async function getServerSideProps() {
  try {
    // 誕生日キャラクターの取得
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedBirthday = `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;

    const birthdayCharacters = await prisma.role.findMany({
      where: {
        birthday: formattedBirthday
      },
      select: {
        id: true,
        name: true,
        seriesName: true,
        birthday: true
      }
    });

    // 放送中コンテンツの取得
    const animeOnAir = await prisma.work.findMany({
      where: {
        category: {
          name: 'アニメ'
        },
        broadcastChannels: {
          some: {
            broadcastEndDate: {
              gt: new Date()
            }
          }
        }
      },
      include: {
        workRoles: {
          where: {
            role: {
              actor: {
                name: '佐藤拓也'
              }
            }
          },
          include: {
            role: true
          }
        },
        broadcastChannels: {
          include: {
            station: true,
            weekday: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    const radioOnAir = await prisma.work.findMany({
      where: {
        category: {
          name: 'ラジオ'
        },
        broadcastChannels: {
          some: {
            broadcastEndDate: {
              gt: new Date()
            }
          }
        }
      },
      include: {
        broadcastChannels: {
          include: {
            station: true,
            weekday: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    const webOnAir = await prisma.work.findMany({
      where: {
        category: {
          name: 'WEB'
        },
        broadcastChannels: {
          some: {
            broadcastEndDate: {
              gt: new Date()
            }
          }
        }
      },
      include: {
        broadcastChannels: {
          include: {
            station: true,
            weekday: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    const onAirData = {
      anime: animeOnAir,
      radio: radioOnAir,
      web: webOnAir
    };

    // スケジュールの取得
    const today2 = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today2.getMonth() + 1);

    const schedules = await prisma.schedule.findMany({
      where: {
        startDate: {
          gte: today2,
          lte: oneMonthLater
        }
      },
      include: {
        category: true,
        venue: true,
        performances: {
          orderBy: {
            performanceDate: 'asc'
          }
        },
        performers: {
          include: {
            performer: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    const formattedSchedules = schedules.map(schedule => {
      const startDate = schedule.startDate;
      const weekday = ['日', '月', '火', '水', '木', '金', '土'][startDate.getDay()];

      return {
        id: schedule.id,
        date: startDate.toISOString().split('T')[0],
        weekday: weekday,
        category: schedule.category.name === 'イベント' ? 'event' :
          schedule.category.name === '舞台・朗読' ? 'stage' :
            schedule.category.name === '生放送' ? 'broadcast' : 'other',
        categoryName: schedule.category.name,
        title: schedule.title,
        time: schedule.performances.length > 0 ?
          schedule.performances.map(p => p.displayStartTime).join(' / ') :
          'TBD',
        location: schedule.venue.name,
        description: schedule.description ||
          (schedule.performers.length > 0 ?
            `出演：${schedule.performers.map(p => p.performer.name).join('、')}` : ''),
        link: schedule.officialUrl || '#'
      };
    });

    // 作品データの取得 (簡略化のため主要カテゴリーのみ)
    const animeWorks = await prisma.work.findMany({
      where: {
        category: {
          name: 'アニメ'
        },
        workRoles: {
          some: {
            role: {
              actor: {
                name: '佐藤拓也'
              }
            }
          }
        }
      },
      include: {
        workRoles: {
          where: {
            role: {
              actor: {
                name: '佐藤拓也'
              }
            }
          },
          include: {
            role: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { title: 'asc' }
      ],
      take: 10 // 最新10件のみ取得
    });

    const gameWorks = await prisma.work.findMany({
      where: {
        category: {
          name: 'ゲーム'
        },
        workRoles: {
          some: {
            role: {
              actor: {
                name: '佐藤拓也'
              }
            }
          }
        }
      },
      include: {
        workRoles: {
          where: {
            role: {
              actor: {
                name: '佐藤拓也'
              }
            }
          },
          include: {
            role: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { title: 'asc' }
      ],
      take: 10 // 最新10件のみ取得
    });

    const formattedWorks = {
      anime: animeWorks.map(work => ({
        id: work.id,
        title: work.title,
        role: work.workRoles[0]?.role.name ? `${work.workRoles[0].role.name} 役` : '',
        isMain: work.workRoles[0]?.isMainRole || false,
        year: work.year ? `${work.year}年` : ''
      })),
      game: gameWorks.map(work => ({
        id: work.id,
        title: work.title,
        role: work.workRoles[0]?.role.name ? `${work.workRoles[0].role.name} 役` : '',
        isMain: work.workRoles[0]?.isMainRole || false,
        year: work.year ? `${work.year}年` : ''
      }))
      // 他のカテゴリーも同様に取得可能
    };

    // 動画を取得
    const videos = await prisma.video.findMany({
      orderBy: {
        publishedAt: 'desc'
      },
      take: 1
    });

    let videoData = null;
    if (videos.length > 0) {
      const video = videos[0];
      const publishedDate = new Date(video.publishedAt);
      const formattedDate = `${publishedDate.getFullYear()}.${String(publishedDate.getMonth() + 1).padStart(2, '0')}.${String(publishedDate.getDate()).padStart(2, '0')}`;

      videoData = {
        id: video.id,
        title: video.title,
        date: formattedDate,
        thumbnailUrl: video.thumbnailUrl,
        videoUrl: video.videoUrl
      };
    }

    // すべてのデータをシリアライズしてpropsとして返す
    return {
      props: {
        birthdaysData: serializeData(birthdayCharacters),
        onAirData: serializeData(onAirData),
        schedulesData: serializeData(formattedSchedules),
        worksData: serializeData(formattedWorks),
        videosData: serializeData(videoData)
      }
    };
  } catch (error) {
    console.error('サーバーサイドデータ取得エラー:', error);
    // エラー時はフォールバックのための空データを返す
    return {
      props: {
        birthdaysData: [],
        onAirData: { anime: [], radio: [], web: [] },
        schedulesData: [],
        worksData: { anime: [], game: [] },
        videosData: null
      }
    };
  }
}