// lib/prisma.js
import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスを宣言
let prisma;

// 環境変数の確認（デバッグ用）
console.log('DATABASE_URL type:', typeof process.env.DATABASE_URL);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 10));
console.log('NODE_ENV:', process.env.NODE_ENV);

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

// Prismaクライアントの初期化（エラー処理付き）
try {
    prisma = getPrismaClient();
    console.log('Prisma Client initialized successfully');
} catch (e) {
    console.error('Failed to initialize Prisma Client:', e);
    throw e;
}

export default prisma;