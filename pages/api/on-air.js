// pages/api/on-air.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const currentDate = new Date();
        console.log(`放送中コンテンツ取得: 現在日時=${currentDate.toISOString()}`);

        // 現在放送中のアニメを取得
        const { data: animeOnAir, error: animeError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                official_url,
                category:category_id (id, name),
                broadcastChannels:rel_broadcast_channels(
                    id,
                    broadcast_start_date,
                    broadcast_end_date,
                    display_broadcast_time,
                    official_url,
                    station:station_id (id, name),
                    weekday:weekday_id (id, name, short_name)
                ),
                workRoles:rel_work_roles(
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:voice_actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'TVアニメ')
            .order('title');

        if (animeError) {
            console.error('アニメデータ取得エラー:', animeError);
            throw animeError;
        }

        // ラジオ・配信番組を取得
        const { data: radioOnAir, error: radioError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                official_url,
                category:category_id (id, name),
                broadcastChannels:rel_broadcast_channels(
                    id,
                    broadcast_start_date,
                    broadcast_end_date,
                    display_broadcast_time,
                    official_url,
                    station:station_id (id, name),
                    weekday:weekday_id (id, name, short_name)
                ),
                workRoles:rel_work_roles(
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:voice_actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'ラジオ')
            .order('title');

        if (radioError) {
            console.error('ラジオデータ取得エラー:', radioError);
            throw radioError;
        }

        // WEB番組を取得
        const { data: webOnAir, error: webError } = await supabase
            .from('works')
            .select(`
                id,
                title,
                official_url,
                category:category_id (id, name),
                broadcastChannels:rel_broadcast_channels(
                    id,
                    broadcast_start_date,
                    broadcast_end_date,
                    display_broadcast_time,
                    official_url,
                    station:station_id (id, name),
                    weekday:weekday_id (id, name, short_name)
                ),
                workRoles:rel_work_roles(
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:voice_actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'WEB')
            .order('title');

        if (webError) {
            console.error('WEB番組データ取得エラー:', webError);
            throw webError;
        }

        // デバッグ出力
        console.log('取得したアニメデータ例:', animeOnAir.length > 0 ? animeOnAir[0] : 'データなし');

        // 現在放送中かどうかをチェックする関数
        const isCurrentlyBroadcasting = (work, currentDate) => {
            // 放送チャンネルがない場合はfalse
            if (!work.broadcastChannels || work.broadcastChannels.length === 0) {
                return false;
            }

            // 少なくとも1つの放送チャンネルが現在放送中かチェック
            return work.broadcastChannels.some(channel => {
                // 放送開始日がない場合はfalse
                if (!channel.broadcast_start_date) {
                    return false;
                }

                const startDate = new Date(channel.broadcast_start_date);

                // 放送終了日がnullで、放送開始日が現在日付以前の場合は放送中
                if (channel.broadcast_end_date === null && startDate <= currentDate) {
                    return true;
                }

                // 放送終了日がある場合、現在日付が放送開始日と放送終了日の間にあるかチェック
                if (channel.broadcast_end_date) {
                    const endDate = new Date(channel.broadcast_end_date);
                    return startDate <= currentDate && currentDate <= endDate;
                }

                return false;
            });
        };

        // 放送チャンネルがまだ放送中かどうかをチェックする関数
        const isChannelCurrentlyBroadcasting = (channel, currentDate) => {
            // 放送開始日がない場合はfalse
            if (!channel.broadcast_start_date) {
                return false;
            }

            const startDate = new Date(channel.broadcast_start_date);

            // 放送終了日がnullで、放送開始日が現在日付以前の場合は放送中
            if (channel.broadcast_end_date === null && startDate <= currentDate) {
                return true;
            }

            // 放送終了日がある場合、現在日付が放送開始日と放送終了日の間にあるかチェック
            if (channel.broadcast_end_date) {
                const endDate = new Date(channel.broadcast_end_date);
                return startDate <= currentDate && currentDate <= endDate;
            }

            return false;
        };

        // 放送情報を整形する関数
        const formatBroadcastInfo = (work) => {
            // 放送中のチャンネルのみをフィルタリング
            const activeChannels = work.broadcastChannels
                .filter(channel => isChannelCurrentlyBroadcasting(channel, currentDate))
                .map(bc => {
                    return {
                        channel: bc.station?.name || 'チャンネル不明',
                        time: bc.display_broadcast_time || '時間未定',
                        officialUrl: bc.official_url
                    };
                });

            // 佐藤拓也の役を抽出（アニメの場合）
            let roleInfo = '';
            if (work.category?.name === 'アニメ') {
                const takuyaRole = work.workRoles && work.workRoles.find(wr =>
                    wr.role?.actor?.name === '佐藤拓也'
                );
                roleInfo = takuyaRole ? `${takuyaRole.role.name} 役` : '';
            }

            return {
                id: work.id,
                title: work.title,
                role: roleInfo,
                broadcasts: activeChannels
            };
        };

        // フィルタリングと整形（カテゴリの再チェック追加）
        const filteredAnime = animeOnAir
            .filter(work => {
                // アニメの場合は佐藤拓也の役がある作品のみ
                return work.workRoles && work.workRoles.some(wr =>
                    wr.role?.actor?.name === '佐藤拓也'
                );
            })
            .filter(work => work.category?.name === 'TVアニメ')  // 再度カテゴリ確認
            .filter(work => isCurrentlyBroadcasting(work, currentDate))  // 放送中かチェック
            .map(formatBroadcastInfo);

        // ラジオとWEB番組はロールのフィルタリングを行わない
        const filteredRadio = radioOnAir
            .filter(work => work.category?.name === 'ラジオ')  // 再度カテゴリ確認
            .filter(work => isCurrentlyBroadcasting(work, currentDate))  // 放送中かチェック
            .map(formatBroadcastInfo);

        const filteredWeb = webOnAir
            .filter(work => work.category?.name === 'WEB')  // 再度カテゴリ確認
            .filter(work => isCurrentlyBroadcasting(work, currentDate))  // 放送中かチェック
            .map(formatBroadcastInfo);

        console.log(`取得結果: アニメ=${filteredAnime.length}件, ラジオ=${filteredRadio.length}件, WEB=${filteredWeb.length}件`);

        return res.status(200).json({
            anime: filteredAnime,
            radio: filteredRadio,
            web: filteredWeb
        });
    } catch (error) {
        console.error('放送中コンテンツの取得エラー:', error);
        return res.status(500).json({
            error: '放送中コンテンツの取得に失敗しました',
            message: error.message,
            details: error.details || error.stack
        });
    }
}