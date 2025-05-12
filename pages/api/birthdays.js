// pages/api/birthdays.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 今日の日付を取得
        const today = new Date();
        const month = today.getMonth() + 1; // 0-11 -> 1-12
        const day = today.getDate();

        // 誕生日が今日のキャラクターを検索 (MM/DD形式)
        const formattedBirthday = `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;

        console.log(`誕生日を検索: ${formattedBirthday}`);

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