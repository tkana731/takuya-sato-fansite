// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // カテゴリの作成
        const animeCategory = await prisma.workCategory.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: 'アニメ',
                displayOrder: 1,
            },
        });

        const gameCategory = await prisma.workCategory.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: 'ゲーム',
                displayOrder: 2,
            },
        });

        const dubMovieCategory = await prisma.workCategory.upsert({
            where: { id: '3' },
            update: {},
            create: {
                id: '3',
                name: '吹き替え（映画）',
                displayOrder: 3,
            },
        });

        const dubDramaCategory = await prisma.workCategory.upsert({
            where: { id: '4' },
            update: {},
            create: {
                id: '4',
                name: '吹き替え（ドラマ）',
                displayOrder: 4,
            },
        });

        const radioCategory = await prisma.workCategory.upsert({
            where: { id: '5' },
            update: {},
            create: {
                id: '5',
                name: 'ラジオ',
                displayOrder: 5,
            },
        });

        const webCategory = await prisma.workCategory.upsert({
            where: { id: '6' },
            update: {},
            create: {
                id: '6',
                name: 'WEB',
                displayOrder: 6,
            },
        });

        const narrationCategory = await prisma.workCategory.upsert({
            where: { id: '7' },
            update: {},
            create: {
                id: '7',
                name: 'ナレーション',
                displayOrder: 7,
            },
        });

        // スケジュールカテゴリの作成
        const eventCategory = await prisma.scheduleCategory.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: 'イベント',
                colorCode: '#ff8a00',
                hasPeriod: false,
                hasPerformances: false,
                displayOrder: 1,
            },
        });

        const stageCategory = await prisma.scheduleCategory.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: '舞台・朗読',
                colorCode: '#8a2be2',
                hasPeriod: true,
                hasPerformances: true,
                displayOrder: 2,
            },
        });

        const broadcastCategory = await prisma.scheduleCategory.upsert({
            where: { id: '3' },
            update: {},
            create: {
                id: '3',
                name: '生放送',
                colorCode: '#00b050',
                hasPeriod: false,
                hasPerformances: false,
                displayOrder: 3,
            },
        });

        // 放送局タイプの作成
        const tvType = await prisma.stationType.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: 'TV',
                displayOrder: 1,
            },
        });

        const radioType = await prisma.stationType.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: 'ラジオ',
                displayOrder: 2,
            },
        });

        const streamingType = await prisma.stationType.upsert({
            where: { id: '3' },
            update: {},
            create: {
                id: '3',
                name: '配信',
                displayOrder: 3,
            },
        });

        // 放送局の作成
        const tokyoMX = await prisma.broadcastStation.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: 'TOKYO MX',
                typeId: tvType.id,
                officialUrl: 'https://s.mxtv.jp/',
                displayOrder: 1,
            },
        });

        const bs11 = await prisma.broadcastStation.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: 'BS11',
                typeId: tvType.id,
                officialUrl: 'https://www.bs11.jp/',
                displayOrder: 2,
            },
        });

        const atx = await prisma.broadcastStation.upsert({
            where: { id: '3' },
            update: {},
            create: {
                id: '3',
                name: 'AT-X',
                typeId: tvType.id,
                officialUrl: 'https://www.at-x.com/',
                displayOrder: 3,
            },
        });

        const abema = await prisma.broadcastStation.upsert({
            where: { id: '4' },
            update: {},
            create: {
                id: '4',
                name: 'ABEMA',
                typeId: streamingType.id,
                officialUrl: 'https://abema.tv/',
                displayOrder: 4,
            },
        });

        const danime = await prisma.broadcastStation.upsert({
            where: { id: '5' },
            update: {},
            create: {
                id: '5',
                name: 'dアニメストア',
                typeId: streamingType.id,
                officialUrl: 'https://anime.dmkt-sp.jp/',
                displayOrder: 5,
            },
        });

        const niconico = await prisma.broadcastStation.upsert({
            where: { id: '6' },
            update: {},
            create: {
                id: '6',
                name: 'ニコニコ生放送',
                typeId: streamingType.id,
                officialUrl: 'https://live.nicovideo.jp/',
                displayOrder: 6,
            },
        });

        const youtube = await prisma.broadcastStation.upsert({
            where: { id: '7' },
            update: {},
            create: {
                id: '7',
                name: 'YouTube',
                typeId: streamingType.id,
                officialUrl: 'https://www.youtube.com/',
                displayOrder: 7,
            },
        });

        const bunkaHoso = await prisma.broadcastStation.upsert({
            where: { id: '8' },
            update: {},
            create: {
                id: '8',
                name: '文化放送',
                typeId: radioType.id,
                officialUrl: 'https://www.joqr.co.jp/',
                displayOrder: 8,
            },
        });

        // 曜日の作成
        const weekdays = [
            { id: '1', name: '月曜日', shortName: '月', code: 'mon', displayOrder: 1 },
            { id: '2', name: '火曜日', shortName: '火', code: 'tue', displayOrder: 2 },
            { id: '3', name: '水曜日', shortName: '水', code: 'wed', displayOrder: 3 },
            { id: '4', name: '木曜日', shortName: '木', code: 'thu', displayOrder: 4 },
            { id: '5', name: '金曜日', shortName: '金', code: 'fri', displayOrder: 5 },
            { id: '6', name: '土曜日', shortName: '土', code: 'sat', displayOrder: 6 },
            { id: '7', name: '日曜日', shortName: '日', code: 'sun', displayOrder: 7 },
        ];

        for (const weekday of weekdays) {
            await prisma.weekday.upsert({
                where: { id: weekday.id },
                update: {},
                create: weekday,
            });
        }

        // 俳優の作成
        const takuyaSato = await prisma.actor.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: '佐藤拓也',
                officialUrl: 'https://www.kenproduction.co.jp/talent/39',
                xUrl: 'https://twitter.com/takuya_satou',
                instagramUrl: 'https://www.instagram.com/takuyasatou_official/',
            },
        });

        // パフォーマーの作成
        const takuyaSatoPerformer = await prisma.performer.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: '佐藤拓也',
                isTakuyaSato: true,
                officialUrl: 'https://www.kenproduction.co.jp/talent/39',
                xUrl: 'https://twitter.com/takuya_satou',
                instagramUrl: 'https://www.instagram.com/takuyasatou_official/',
            },
        });

        // 都道府県の作成
        const tokyo = await prisma.prefecture.upsert({
            where: { id: '13' },
            update: {},
            create: {
                id: '13',
                name: '東京都',
                region: '関東',
                code: '13',
                displayOrder: 13,
            },
        });

        // 会場の作成
        const shibuyaStreamHall = await prisma.venue.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: '渋谷ストリームホール',
                postalCode: '150-0002',
                prefectureId: tokyo.id,
                address: '東京都渋谷区渋谷3-21-3',
                capacity: '約700名',
                officialUrl: 'https://stream-hall.jp/',
                googleMapsUrl: 'https://goo.gl/maps/6JZqQZ2Z8Z2Z2Z2Z2',
                displayOrder: 1,
            },
        });

        const tokyoGeijutsuGekijo = await prisma.venue.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: '東京芸術劇場',
                postalCode: '171-0021',
                prefectureId: tokyo.id,
                address: '東京都豊島区西池袋1-8-1',
                capacity: '1,999名',
                officialUrl: 'https://www.geigeki.jp/',
                googleMapsUrl: 'https://goo.gl/maps/1JZqQZ2Z8Z2Z2Z2Z2',
                displayOrder: 2,
            },
        });

        const yokohamaArena = await prisma.venue.upsert({
            where: { id: '3' },
            update: {},
            create: {
                id: '3',
                name: '横浜アリーナ',
                postalCode: '222-0033',
                prefectureId: tokyo.id, // 厳密には神奈川県だが、サンプルのためtokyo.idを利用
                address: '神奈川県横浜市港北区新横浜3-10',
                capacity: '約17,000名',
                officialUrl: 'https://www.yokohama-arena.co.jp/',
                googleMapsUrl: 'https://goo.gl/maps/2JZqQZ2Z8Z2Z2Z2Z2',
                displayOrder: 3,
            },
        });

        // シリーズの作成
        const idolish7 = await prisma.series.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: 'IDOLiSH7',
                description: 'アイドル育成ゲーム「アイドリッシュセブン」のメディアミックス作品',
                officialUrl: 'https://idolish7.com/',
                xUrl: 'https://twitter.com/iD7Mng_Ogami',
                displayOrder: 1,
            },
        });

        const toukenRanbu = await prisma.series.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: '刀剣乱舞',
                description: 'ブラウザゲーム「刀剣乱舞-ONLINE-」のメディアミックス作品',
                officialUrl: 'https://touken-ranbu.jp/',
                xUrl: 'https://twitter.com/tkrb_staff',
                displayOrder: 2,
            },
        });

        // 役の作成（今日の誕生日キャラクター用）
        // これは動的に変更されるため、日付を確認して作成
        const today = new Date();
        const month = today.getMonth() + 1; // 0-11 -> 1-12
        const day = today.getDate();
        const formattedBirthday = `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;

        // 本日が5月10日なら十龍之介と燭台切光忠を今日の誕生日キャラクターに
        if (formattedBirthday === '05/10') {
            const torahRyunosuke = await prisma.role.upsert({
                where: { id: '1' },
                update: {},
                create: {
                    id: '1',
                    name: '十龍之介',
                    actorId: takuyaSato.id,
                    birthday: '05/10',
                    seriesName: 'IDOLiSH7',
                },
            });

            const shokudaikiriMitsutada = await prisma.role.upsert({
                where: { id: '2' },
                update: {},
                create: {
                    id: '2',
                    name: '燭台切光忠',
                    actorId: takuyaSato.id,
                    birthday: '05/10',
                    seriesName: '刀剣乱舞',
                },
            });
        }
        // 他の日付には別のキャラクターを登録することも可能

        // 作品の作成（アニメの例）
        const idolish7Anime = await prisma.work.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                categoryId: animeCategory.id,
                title: 'アイドリッシュセブン Third BEAT!',
                year: 2025,
                description: 'アイドルグループIDOLiSH7の活躍を描くアニメ',
                officialUrl: 'https://idolish7.com/aninana/',
            },
        });

        const classicStars = await prisma.work.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                categoryId: animeCategory.id,
                title: 'クラシック★スターズ',
                year: 2025,
                description: '名作曲家たちが現代に転生してアイドルとして活躍するアニメ',
                officialUrl: 'https://example.com/classic-stars/',
            },
        });

        // 作品とシリーズの関連付け
        const idolish7Relation = await prisma.workSeries.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                seriesId: idolish7.id,
                workId: idolish7Anime.id,
                sequenceNumber: 3,
                subtitle: 'Third BEAT!',
                displayOrder: 1,
            },
        });

        // 役と作品の関連付け
        if (formattedBirthday === '05/10') {
            const torahRole = await prisma.workRole.upsert({
                where: { id: '1' },
                update: {},
                create: {
                    id: '1',
                    workId: idolish7Anime.id,
                    roleId: '1', // 十龍之介
                    isMainRole: true,
                    displayOrder: 1,
                },
            });
        }

        // 放送情報
        const todayBroadcast = new Date();
        const endBroadcast = new Date();
        endBroadcast.setMonth(endBroadcast.getMonth() + 3); // 3か月後

        const tokyoMXBroadcast = await prisma.broadcastChannel.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                workId: idolish7Anime.id,
                stationId: tokyoMX.id,
                weekdayId: '7', // 日曜日
                displayBroadcastTime: '22:30～',
                broadcastStartDate: todayBroadcast,
                broadcastEndDate: endBroadcast,
                description: '',
            },
        });

        const bs11Broadcast = await prisma.broadcastChannel.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                workId: idolish7Anime.id,
                stationId: bs11.id,
                weekdayId: '1', // 月曜日
                displayBroadcastTime: '24:00～',
                broadcastStartDate: todayBroadcast,
                broadcastEndDate: endBroadcast,
                description: '',
            },
        });

        // スケジュールの作成
        const scheduleDate1 = new Date('2025-05-10');
        const schedule1 = await prisma.schedule.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                categoryId: eventCategory.id,
                workId: idolish7Anime.id,
                venueId: shibuyaStreamHall.id,
                title: 'アイドリッシュセブン ファンミーティング',
                startDate: scheduleDate1,
                isAllDay: false,
                description: '十龍之介役として出演',
                officialUrl: 'https://example.com/idolish7-fanmeeting',
            },
        });

        // パフォーマンスの追加
        const performance1 = await prisma.schedulePerformance.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                scheduleId: schedule1.id,
                performanceDate: scheduleDate1,
                displayStartTime: '14:00～',
                displayEndTime: '16:30',
                description: '',
                displayOrder: 1,
            },
        });

        // スケジュール出演者の追加
        const schedulePerformer1 = await prisma.schedulePerformer.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                scheduleId: schedule1.id,
                performerId: takuyaSatoPerformer.id,
                roleDescription: '十龍之介役',
                displayOrder: 1,
            },
        });

        // 動画の追加
        const video1 = await prisma.video.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                title: '【声優】佐藤拓也の声優としての魅力に迫る！',
                thumbnailUrl: '/api/placeholder/400/225',
                videoUrl: 'https://www.youtube.com/watch?v=example',
                publishedAt: new Date('2025-05-08'),
            },
        });

        console.log('シードデータが正常に投入されました');
    } catch (error) {
        console.error('シードデータの投入エラー:', error);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });