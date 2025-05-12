// pages/api/works.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('作品データの取得リクエストを受信しました');

        // アニメ作品を取得
        console.log('アニメ作品を取得中...');
        const { data: animeWorks, error: animeError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                year,
                category:category_id (id, name),
                workRoles:rel_work_roles(
                    id,
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'アニメ')
            .order('year', { ascending: false })
            .order('title');

        if (animeError) {
            console.error('アニメ作品取得エラー:', animeError);
            throw animeError;
        }

        console.log(`${animeWorks?.length || 0}件のアニメ作品を取得しました`);

        // ゲーム作品を取得
        console.log('ゲーム作品を取得中...');
        const { data: gameWorks, error: gameError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                year,
                category:category_id (id, name),
                workRoles:rel_work_roles(
                    id,
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'ゲーム')
            .order('year', { ascending: false })
            .order('title');

        if (gameError) {
            console.error('ゲーム作品取得エラー:', gameError);
            throw gameError;
        }

        console.log(`${gameWorks?.length || 0}件のゲーム作品を取得しました`);

        // 吹き替え（映画）を取得
        console.log('吹き替え（映画）を取得中...');
        const { data: dubMovieWorks, error: dubMovieError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                year,
                category:category_id (id, name),
                workRoles:rel_work_roles(
                    id,
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', '吹き替え（映画）')
            .order('year', { ascending: false })
            .order('title');

        if (dubMovieError) {
            console.error('吹き替え（映画）取得エラー:', dubMovieError);
            throw dubMovieError;
        }

        console.log(`${dubMovieWorks?.length || 0}件の吹き替え（映画）を取得しました`);

        // 吹き替え（ドラマ）を取得
        console.log('吹き替え（ドラマ）を取得中...');
        const { data: dubDramaWorks, error: dubDramaError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                year,
                category:category_id (id, name),
                workRoles:rel_work_roles(
                    id,
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', '吹き替え（ドラマ）')
            .order('year', { ascending: false })
            .order('title');

        if (dubDramaError) {
            console.error('吹き替え（ドラマ）取得エラー:', dubDramaError);
            throw dubDramaError;
        }

        console.log(`${dubDramaWorks?.length || 0}件の吹き替え（ドラマ）を取得しました`);

        // ナレーションを取得
        console.log('ナレーションを取得中...');
        const { data: narrationWorks, error: narrationError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                year,
                description,
                category:category_id (id, name)
            `)
            .eq('category.name', 'ナレーション')
            .order('year', { ascending: false })
            .order('title');

        if (narrationError) {
            console.error('ナレーション取得エラー:', narrationError);
            throw narrationError;
        }

        console.log(`${narrationWorks?.length || 0}件のナレーションを取得しました`);

        // ラジオ・配信番組を取得
        console.log('ラジオ・配信番組を取得中...');
        const { data: radioWorks, error: radioError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                year,
                category:category_id (id, name)
            `)
            .eq('category.name', 'ラジオ')
            .order('year', { ascending: false })
            .order('title');

        if (radioError) {
            console.error('ラジオ・配信番組取得エラー:', radioError);
            throw radioError;
        }

        console.log(`${radioWorks?.length || 0}件のラジオ・配信番組を取得しました`);

        // 佐藤拓也さんが演じる役割のみをフィルタリングする関数
        const filterTakuyaSatoRoles = (work) => {
            // 役割が登録されていない場合は空配列を返す
            if (!work.workRoles || work.workRoles.length === 0) {
                return [];
            }

            // 佐藤拓也さんが演じる役割のみをフィルタリング
            return work.workRoles.filter(workRole =>
                workRole.role?.actor?.name === '佐藤拓也'
            );
        };

        // 整形したデータを生成する関数
        const formatWork = (work, takuyaRoles) => {
            const mainRole = takuyaRoles.find(r => r.is_main_role);
            const role = mainRole || takuyaRoles[0]; // メイン役割または最初の役割

            return {
                id: work.id,
                title: work.title,
                role: role?.role?.name ? `${role.role.name} 役` : '',
                isMain: role?.is_main_role || false,
                year: work.year ? `${work.year}年` : ''
            };
        };

        // 各カテゴリの作品を整形
        const formattedAnime = animeWorks.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role); // 佐藤拓也の役割がある作品のみ

        const formattedGame = gameWorks.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role);

        const formattedDubMovie = dubMovieWorks.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role);

        const formattedDubDrama = dubDramaWorks.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role);

        const formattedNarration = narrationWorks.map(work => ({
            id: work.id,
            title: work.title,
            role: work.description || '',
            year: work.year ? `${work.year}年` : ''
        }));

        const formattedRadio = radioWorks.map(work => ({
            id: work.id,
            title: work.title,
            year: work.year ? `${work.year}年～` : ''
        }));

        // 整形した作品データをレスポンスとして返す
        const formattedWorks = {
            anime: formattedAnime,
            game: formattedGame,
            dub: {
                movie: formattedDubMovie,
                drama: formattedDubDrama
            },
            other: {
                narration: formattedNarration,
                radio: formattedRadio
            }
        };

        console.log('作品データを整形して返します');
        console.log(`アニメ: ${formattedAnime.length}件, ゲーム: ${formattedGame.length}件, 映画吹替: ${formattedDubMovie.length}件, ドラマ吹替: ${formattedDubDrama.length}件`);

        return res.status(200).json(formattedWorks);
    } catch (error) {
        console.error('作品データの取得エラー:', error);
        return res.status(500).json({
            error: '作品データの取得に失敗しました',
            message: error.message,
            details: error.details || error.stack
        });
    }
}