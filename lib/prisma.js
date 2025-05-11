// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスを宣言
let prisma;

// 本番環境ではPrismaClientを作成し、それを再利用
// 開発環境では、各モジュールでホットリロードが行われるため、グローバル変数に保存
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    // Node.jsのグローバルオブジェクトにPrismaClientが存在しない場合は作成
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;