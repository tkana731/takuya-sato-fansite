// pages/api/birthdays.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 現在のUTC時間を取得
        const utcNow = new Date();

        // 日本時間のオフセット（UTC+9時間）を計算
        const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換

        // UTC時間に9時間を追加して日本時間を取得
        const todayJST = new Date(utcNow.getTime() + jstOffset);

        // 日本時間に基づいて月と日を取得
        const month = todayJST.getMonth() + 1; // 0-11 -> 1-12
        const day = todayJST.getDate();

        // 誕生日が今日のキャラクターを検索 (MM/DD形式)
        const formattedBirthday = `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;

        console.log(`日本時間での誕生日を検索: ${formattedBirthday} (JST: ${todayJST.toISOString()})`);

        // 誕生日が今日のキャラクターを取得 (Supabaseクエリ)
        const { data: birthdayCharacters, error } = await supabase
            .from('mst_roles')
            .select(`
                id,
                name,
                series_name,
                birthday,
                actor:actor_id (id, name)
            `)
            .eq('birthday', formattedBirthday)
            .order('name');

        if (error) {
            console.error('Supabaseクエリエラー:', error);
            throw error;
        }

        console.log(`キャラクター検索結果: ${birthdayCharacters?.length || 0}件`);

        // 佐藤拓也さん演じる役のみをフィルタリング
        const filteredCharacters = birthdayCharacters.filter(char =>
            char.actor && char.actor.name === '佐藤拓也'
        );

        console.log(`佐藤拓也が演じるキャラクター: ${filteredCharacters.length}件`);

        // 簡略化したデータを返す
        const result = filteredCharacters.map(char => ({
            id: char.id,
            name: char.name,
            seriesName: char.series_name || ''
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error('誕生日キャラクターの取得エラー:', error);
        return res.status(500).json({
            error: '誕生日キャラクターの取得に失敗しました',
            message: error.message,
            details: error.details || error.stack
        });
    }
}