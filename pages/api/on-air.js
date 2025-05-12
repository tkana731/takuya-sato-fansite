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
                category:category_id (id, name),
                broadcastChannels:rel_broadcast_channels(
                    id,
                    broadcastEndDate:broadcast_end_date,
                    displayBroadcastTime:display_broadcast_time,
                    station:station_id (id, name),
                    weekday:weekday_id (id, name, short_name)
                ),
                workRoles:rel_work_roles(
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'アニメ')
            .gte('rel_broadcast_channels.broadcast_start_date', currentDate.toISOString().split('T')[0])
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
                category:category_id (id, name),
                broadcastChannels:rel_broadcast_channels(
                    id,
                    broadcastEndDate:broadcast_end_date,
                    displayBroadcastTime:display_broadcast_time,
                    station:station_id (id, name),
                    weekday:weekday_id (id, name, short_name)
                ),
                workRoles:rel_work_roles(
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'ラジオ')
            .gte('rel_broadcast_channels.broadcast_start_date', currentDate.toISOString().split('T')[0])
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
                category:category_id (id, name),
                broadcastChannels:rel_broadcast_channels(
                    id,
                    broadcastEndDate:broadcast_end_date,
                    displayBroadcastTime:display_broadcast_time,
                    station:station_id (id, name),
                    weekday:weekday_id (id, name, short_name)
                ),
                workRoles:rel_work_roles(
                    is_main_role,
                    role:role_id (
                        id,
                        name,
                        actor:actor_id (id, name)
                    )
                )
            `)
            .eq('category.name', 'WEB')
            .gte('rel_broadcast_channels.broadcast_start_date', currentDate.toISOString().split('T')[0])
            .order('title');

        if (webError) {
            console.error('WEB番組データ取得エラー:', webError);
            throw webError;
        }

        // 佐藤拓也のロールのみがある作品をフィルタリングする関数
        const hasTakuyaSatoRole = (work) => {
            return work.workRoles.some(wr =>
                wr.role?.actor?.name === '佐藤拓也'
            );
        };

        // 放送情報を整形する関数
        const formatBroadcastInfo = (work) => {
            // データ形式を変換
            const formattedBroadcasts = work.broadcastChannels.map(bc => {
                return {
                    channel: bc.station?.name || 'チャンネル不明',
                    time: bc.displayBroadcastTime || '時間未定'
                };
            });

            // 佐藤拓也の役を抽出
            const takuyaRole = work.workRoles.find(wr =>
                wr.role?.actor?.name === '佐藤拓也'
            );

            return {
                id: work.id,
                title: work.title,
                role: takuyaRole ? `${takuyaRole.role.name} 役` : '',
                broadcasts: formattedBroadcasts
            };
        };

        // フィルタリングと整形（カテゴリの再チェック追加）
        const filteredAnime = animeOnAir
            .filter(hasTakuyaSatoRole)
            .filter(work => work.category?.name === 'アニメ')  // 再度カテゴリ確認
            .map(formatBroadcastInfo);

        const filteredRadio = radioOnAir
            .filter(hasTakuyaSatoRole)
            .filter(work => work.category?.name === 'ラジオ')  // 再度カテゴリ確認
            .map(formatBroadcastInfo);

        const filteredWeb = webOnAir
            .filter(hasTakuyaSatoRole)
            .filter(work => work.category?.name === 'WEB')  // 再度カテゴリ確認
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