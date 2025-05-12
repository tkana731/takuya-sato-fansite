// pages/api/works.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('作品データの取得リクエストを受信しました');

        // 必要な作品カテゴリーIDを一度に取得
        const { data: categories, error: categoryError } = await supabase
            .from('mst_work_categories')
            .select('id, name');

        if (categoryError) {
            console.error('カテゴリ取得エラー:', categoryError);
            throw categoryError;
        }

        // カテゴリーマップを作成（IDからカテゴリー名を素早く取得できるように）
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = cat.name;
        });

        // アニメとゲームのカテゴリーIDを特定
        const animeCategory = categories.find(c => c.name === 'アニメ')?.id;
        const gameCategory = categories.find(c => c.name === 'ゲーム')?.id;
        const dubMovieCategory = categories.find(c => c.name === '吹き替え（映画）')?.id;
        const dubDramaCategory = categories.find(c => c.name === '吹き替え（ドラマ）')?.id;
        const narrationCategory = categories.find(c => c.name === 'ナレーション')?.id;
        const radioCategory = categories.find(c => c.name === 'ラジオ')?.id;

        // 佐藤拓也の役割のみをフィルタリングする関数
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

        // 並列処理でカテゴリごとのデータを取得
        const [animeResult, gameResult, dubMovieResult, dubDramaResult, narrationResult, radioResult] = await Promise.all([
            // アニメ作品を取得
            animeCategory ? supabase
                .from('works')
                .select(`
                    id,
                    title,
                    year,
                    category_id,
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
                .eq('category_id', animeCategory)
                .order('year', { ascending: false })
                .order('title') : { data: [] },

            // ゲーム作品を取得
            gameCategory ? supabase
                .from('works')
                .select(`
                    id,
                    title,
                    year,
                    category_id,
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
                .eq('category_id', gameCategory)
                .order('year', { ascending: false })
                .order('title') : { data: [] },

            // 吹き替え（映画）を取得
            dubMovieCategory ? supabase
                .from('works')
                .select(`
                    id,
                    title,
                    year,
                    category_id,
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
                .eq('category_id', dubMovieCategory)
                .order('year', { ascending: false })
                .order('title') : { data: [] },

            // 吹き替え（ドラマ）を取得
            dubDramaCategory ? supabase
                .from('works')
                .select(`
                    id,
                    title,
                    year,
                    category_id,
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
                .eq('category_id', dubDramaCategory)
                .order('year', { ascending: false })
                .order('title') : { data: [] },

            // ナレーションを取得
            narrationCategory ? supabase
                .from('works')
                .select(`
                    id,
                    title,
                    year,
                    description,
                    category_id
                `)
                .eq('category_id', narrationCategory)
                .order('year', { ascending: false })
                .order('title') : { data: [] },

            // ラジオ・配信番組を取得
            radioCategory ? supabase
                .from('works')
                .select(`
                    id,
                    title,
                    year,
                    category_id
                `)
                .eq('category_id', radioCategory)
                .order('year', { ascending: false })
                .order('title') : { data: [] }
        ]);

        // エラーチェック
        if (animeResult.error) throw animeResult.error;
        if (gameResult.error) throw gameResult.error;
        if (dubMovieResult.error) throw dubMovieResult.error;
        if (dubDramaResult.error) throw dubDramaResult.error;
        if (narrationResult.error) throw narrationResult.error;
        if (radioResult.error) throw radioResult.error;

        // 各カテゴリの作品を整形
        const formattedAnime = animeResult.data.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role); // 佐藤拓也の役割がある作品のみ

        const formattedGame = gameResult.data.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role);

        const formattedDubMovie = dubMovieResult.data.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role);

        const formattedDubDrama = dubDramaResult.data.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role);

        const formattedNarration = narrationResult.data.map(work => ({
            id: work.id,
            title: work.title,
            role: work.description || '',
            year: work.year ? `${work.year}年` : ''
        }));

        const formattedRadio = radioResult.data.map(work => ({
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