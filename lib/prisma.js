// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスを宣言
let prisma;

// クライアントの初期化とグローバル設定
function getPrismaClient() {
    if (process.env.NODE_ENV === 'production') {
        // 本番環境用の設定（ログレベルを調整）
        return new PrismaClient({
            log: ['error', 'warn'],
        });
    } else {
        // 開発環境ではホットリロードの問題を回避するためにグローバル変数を使用
        if (!global.prisma) {
            global.prisma = new PrismaClient({
                log: ['query', 'error', 'warn'],
            });
        }
        return global.prisma;
    }
}

// Prismaクライアントの初期化
prisma = getPrismaClient();

export default prisma;