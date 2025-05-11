// pages/api/characters/index.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // クエリパラメータからフィルタリング条件を取得
            const { actorId, search, hasBirthday } = req.query;

            // クエリ条件を作成
            const where = {};

            // 声優IDによるフィルタリング
            if (actorId) {
                where.actorId = actorId;
            }

            // 誕生日の有無でフィルタリング
            if (hasBirthday === 'true') {
                where.birthday = { not: null };
            } else if (hasBirthday === 'false') {
                where.birthday = null;
            }

            // 名前による検索
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { seriesName: { contains: search, mode: 'insensitive' } }
                ];
            }

            // キャラクターデータを取得
            const characters = await prisma.role.findMany({
                where,
                include: {
                    actor: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return res.status(200).json({
                success: true,
                data: characters
            });
        } catch (error) {
            console.error('キャラクターデータの取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'キャラクターデータの取得に失敗しました',
                error: error.message
            });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, actorId, birthday, seriesName } = req.body;

            // バリデーション
            if (!name || !actorId) {
                return res.status(400).json({
                    success: false,
                    message: '名前と声優は必須項目です'
                });
            }

            // 誕生日のバリデーション（存在する場合）
            if (birthday) {
                const birthdayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
                if (!birthdayRegex.test(birthday)) {
                    return res.status(400).json({
                        success: false,
                        message: '誕生日はMM/DD形式（例:05/15）で入力してください'
                    });
                }
            }

            // Prismaクライアントを使用してキャラクターを作成
            const newCharacter = await prisma.role.create({
                data: {
                    name,
                    actorId,
                    birthday: birthday || null,
                    seriesName: seriesName || null
                }
            });

            return res.status(201).json({
                success: true,
                data: newCharacter,
                message: 'キャラクターが正常に登録されました'
            });
        } catch (error) {
            console.error('キャラクター登録エラー:', error);
            return res.status(500).json({
                success: false,
                message: 'キャラクターの登録に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}