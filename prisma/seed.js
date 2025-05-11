const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // ワークカテゴリを作成
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

    // スケジュールカテゴリを作成
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

    // モックにあるスケジュールデータなどを投入
    // ...

    console.log('シードデータが正常に投入されました');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });