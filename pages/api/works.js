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

        // 各カテゴリーIDを特定
        const animeCategory = categories.find(c => c.name === 'アニメ')?.id;
        const gameCategory = categories.find(c => c.name === 'ゲーム')?.id;
        const dubMovieCategory = categories.find(c => c.name === '吹き替え（映画）')?.id;
        const dubDramaCategory = categories.find(c => c.name === '吹き替え（ドラマ）')?.id;
        const dubAnimeCategory = categories.find(c => c.name === '吹き替え（アニメ）')?.id;
        const narrationCategory = categories.find(c => c.name === 'ナレーション')?.id;
        const radioCategory = categories.find(c => c.name === 'ラジオ')?.id;
        const specialCategory = categories.find(c => c.name === '特撮')?.id;
        const stageCategory = categories.find(c => c.name === '舞台')?.id;
        const dramaCategory = categories.find(c => c.name === 'ドラマ')?.id;
        const dramaCDCategory = categories.find(c => c.name === 'ドラマCD')?.id;
        const blcdCategory = categories.find(c => c.name === 'BLCD')?.id;
        const comicCategory = categories.find(c => c.name === 'ボイスコミック')?.id;
        const webCategory = categories.find(c => c.name === 'WEB')?.id;

        console.log('取得したカテゴリー:', categories.map(c => c.name));

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
            // すべての役割名を抽出（配列）
            const roleNames = takuyaRoles.map(r => r.role?.name).filter(Boolean);

            // 役割が複数ある場合は「、」で区切ってテキスト化
            const rolesText = roleNames.length > 0 ? roleNames.join('、') : '';

            // メイン役割が1つでもあるかどうかをチェック
            const hasMainRole = takuyaRoles.some(r => r.is_main_role);

            // 複数の役がある場合は roles 配列として返す
            if (roleNames.length > 1) {
                return {
                    id: work.id,
                    title: work.title,
                    roles: takuyaRoles.map(r => ({
                        name: r.role?.name,
                        isMain: r.is_main_role
                    })),
                    year: work.year ? `${work.year}年` : ''
                };
            }

            return {
                id: work.id,
                title: work.title,
                role: rolesText,
                isMain: hasMainRole,
                year: work.year ? `${work.year}年` : ''
            };
        };

        // 特殊な整形関数（ナレーション、ラジオなど）
        const formatSpecialWork = (work) => ({
            id: work.id,
            title: work.title,
            role: work.description || '',
            year: work.year ? `${work.year}年` : ''
        });

        const formatRadioWork = (work) => ({
            id: work.id,
            title: work.title,
            year: work.year ? `${work.year}年～` : ''
        });

        // 並列処理でカテゴリごとのデータを取得
        const fetchPromises = [];

        // アニメ作品
        if (animeCategory) {
            fetchPromises.push(
                supabase
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
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', animeCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // ゲーム作品
        if (gameCategory) {
            fetchPromises.push(
                supabase
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
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', gameCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // 吹き替え（映画）
        if (dubMovieCategory) {
            fetchPromises.push(
                supabase
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
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', dubMovieCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // 吹き替え（ドラマ）
        if (dubDramaCategory) {
            fetchPromises.push(
                supabase
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
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', dubDramaCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // 吹き替え（アニメ）
        if (dubAnimeCategory) {
            fetchPromises.push(
                supabase
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
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', dubAnimeCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // ナレーション
        if (narrationCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id,
                        workRoles:rel_work_roles(
                            id,
                            is_main_role,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', narrationCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // ラジオ
        if (radioCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        category_id
                    `)
                    .eq('category_id', radioCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // 特撮
        if (specialCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id,
                        workRoles:rel_work_roles(
                            id,
                            is_main_role,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', specialCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // 舞台
        if (stageCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id,
                        workRoles:rel_work_roles(
                            id,
                            is_main_role,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', stageCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // ドラマ
        if (dramaCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id,
                        workRoles:rel_work_roles(
                            id,
                            is_main_role,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', dramaCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // ドラマCD
        if (dramaCDCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id,
                        workRoles:rel_work_roles(
                            id,
                            is_main_role,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', dramaCDCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // BLCD
        if (blcdCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id,
                        workRoles:rel_work_roles(
                            id,
                            is_main_role,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', blcdCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // ボイスコミック
        if (comicCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id,
                        workRoles:rel_work_roles(
                            id,
                            is_main_role,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        )
                    `)
                    .eq('category_id', comicCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // WEB番組
        if (webCategory) {
            fetchPromises.push(
                supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        year,
                        description,
                        category_id
                    `)
                    .eq('category_id', webCategory)
                    .order('year', { ascending: false })
                    .order('title')
            );
        } else {
            fetchPromises.push({ data: [] });
        }

        // 全ての取得を実行
        const [
            animeResult,
            gameResult,
            dubMovieResult,
            dubDramaResult,
            dubAnimeResult,
            narrationResult,
            radioResult,
            specialResult,
            stageResult,
            dramaResult,
            dramaCDResult,
            blcdResult,
            comicResult,
            webResult
        ] = await Promise.all(fetchPromises);

        // エラーチェック
        const results = [animeResult, gameResult, dubMovieResult, dubDramaResult, dubAnimeResult, narrationResult, radioResult, specialResult, stageResult, dramaResult, dramaCDResult, blcdResult, comicResult, webResult];
        for (const result of results) {
            if (result.error) throw result.error;
        }

        // 各カテゴリの作品を整形
        const formattedAnime = animeResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || []; // 佐藤拓也の役割がある作品のみ

        const formattedGame = gameResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedDubMovie = dubMovieResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedDubDrama = dubDramaResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedDubAnime = dubAnimeResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedNarration = narrationResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];
        const formattedRadio = radioResult.data?.map(work => formatRadioWork(work)) || [];

        // 特撮と舞台を統合
        const formattedSpecial = [
            ...(specialResult.data?.map(work => {
                const takuyaRoles = filterTakuyaSatoRoles(work);
                return formatWork(work, takuyaRoles);
            }).filter(work => work.role || work.roles) || []),
            ...(stageResult.data?.map(work => {
                const takuyaRoles = filterTakuyaSatoRoles(work);
                return formatWork(work, takuyaRoles);
            }).filter(work => work.role || work.roles) || [])
        ];

        const formattedDrama = dramaResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedDramaCD = dramaCDResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedBLCD = blcdResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedComic = comicResult.data?.map(work => {
            const takuyaRoles = filterTakuyaSatoRoles(work);
            return formatWork(work, takuyaRoles);
        }).filter(work => work.role || work.roles) || [];

        const formattedWeb = webResult.data?.map(work => formatRadioWork(work)) || [];

        // 整形した作品データをレスポンスとして返す
        const formattedWorks = {
            anime: formattedAnime,
            game: formattedGame,
            dub: {
                movie: formattedDubMovie,
                drama: formattedDubDrama,
                anime: formattedDubAnime
            },
            other: {
                special: formattedSpecial,
                radio: [...formattedRadio, ...formattedWeb], // ラジオとWEBを統合
                voice: formattedNarration, // ナレーションをvoiceとして配置
                comic: formattedComic,
                drama: formattedDrama,
                dramaCD: formattedDramaCD,
                blcd: formattedBLCD
            }
        };

        console.log('作品データを整形して返します');
        console.log(`アニメ: ${formattedAnime.length}件, ゲーム: ${formattedGame.length}件`);
        console.log(`映画吹替: ${formattedDubMovie.length}件, ドラマ吹替: ${formattedDubDrama.length}件, アニメ吹替: ${formattedDubAnime.length}件`);
        console.log(`特撮/舞台: ${formattedSpecial.length}件, ラジオ: ${formattedRadio.length + formattedWeb.length}件, ナレーション: ${formattedNarration.length}件`);
        console.log(`ボイスコミック: ${formattedComic.length}件, ドラマ: ${formattedDrama.length}件, ドラマCD: ${formattedDramaCD.length}件, BLCD: ${formattedBLCD.length}件`);

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