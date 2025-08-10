// pages/api/works/[id].js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: '作品IDが指定されていません'
        });
    }

    // GET: 作品取得
    if (req.method === 'GET') {
        try {
            // 詳細情報を含めるかどうかのフラグ
            const { detail } = req.query;
            
            if (detail === 'true') {
                // 詳細ページ用の豊富な情報を取得
                const { data: work, error } = await supabase
                    .from('works')
                    .select(`
                        id,
                        title,
                        official_url,
                        description,
                        year,
                        category:category_id (id, name),
                        broadcastChannels:rel_broadcast_channels (
                            id,
                            station:mst_broadcast_stations (id, name)
                        ),
                        workRoles:rel_work_roles (
                            id,
                            is_main_role,
                            display_order,
                            role:role_id (
                                id,
                                name,
                                actor:voice_actor_id (id, name)
                            )
                        ),
                        staff:rel_work_staff (
                            id,
                            staff:staff_id (id, name),
                            role:staff_role_id (id, name),
                            display_order
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('作品詳細取得エラー:', error);
                    throw error;
                }

                if (!work) {
                    return res.status(404).json({
                        success: false,
                        message: '指定された作品が見つかりません'
                    });
                }

                // 基本情報のみ対応

                // 出演者情報を整形（表示順で並び替え、佐藤拓也さんを最初に）
                const performers = work.workRoles
                    .filter(wr => wr.role && wr.role.actor)
                    .sort((a, b) => {
                        // 佐藤拓也さんを最初に
                        const aIsTakuya = a.role.actor.name === '佐藤拓也';
                        const bIsTakuya = b.role.actor.name === '佐藤拓也';
                        if (aIsTakuya && !bIsTakuya) return -1;
                        if (!aIsTakuya && bIsTakuya) return 1;
                        // その他は表示順
                        return (a.display_order || 0) - (b.display_order || 0);
                    })
                    .map(wr => ({
                        name: wr.role.actor.name,
                        character: wr.role.name,
                        roleType: wr.is_main_role ? 'main' : 'sub',
                        isTakuyaSato: wr.role.actor.name === '佐藤拓也'
                    }));

                // スタッフ情報を整形（役職別にグループ化）
                const staffByRole = {};
                work.staff
                    .filter(s => s.staff && s.role)
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .forEach(s => {
                        const roleName = s.role.name;
                        if (!staffByRole[roleName]) {
                            staffByRole[roleName] = [];
                        }
                        staffByRole[roleName].push(s.staff.name);
                    });

                // 関連商品を取得（ProductBase.workIdフィールドを使用）
                const { data: relatedProducts, error: productsError } = await supabase
                    .from('product_base')
                    .select(`
                        id,
                        title,
                        releaseDate:release_date,
                        releaseDateDisplay:release_date_display,
                        description,
                        officialUrl:official_url,
                        seriesName:series_name,
                        volumeNumber:volume_number,
                        volumeTitle:volume_title,
                        displayOrder:display_order,
                        category:category_id (
                            id,
                            name,
                            code
                        ),
                        variants:product_variants (
                            id,
                            variantName:variant_name,
                            productCode:product_code,
                            price,
                            status,
                            officialUrl:official_url,
                            mediaType:media_type_id (
                                id,
                                name,
                                code
                            ),
                            affiliateLinks:rel_product_affiliate_links (
                                id,
                                url,
                                platform:platform_id (
                                    id,
                                    name,
                                    code
                                )
                            )
                        )
                    `)
                    .eq('work_id', id)
                    .order('display_order');

                if (productsError) {
                    console.warn('関連商品取得エラー:', productsError);
                }

                // 関連商品を整形
                const formattedProducts = (relatedProducts || [])
                    .map(product => {
                        // バリエーションを整形
                        const variants = (product.variants || [])
                            .map(v => ({
                                id: v.id,
                                name: v.variantName,
                                code: v.productCode,
                                price: v.price,
                                status: v.status,
                                officialUrl: v.officialUrl,
                                mediaType: v.mediaType ? {
                                    id: v.mediaType.id,
                                    name: v.mediaType.name,
                                    code: v.mediaType.code
                                } : null,
                                affiliateLinks: (v.affiliateLinks || []).map(link => ({
                                    id: link.id,
                                    url: link.url,
                                    platform: link.platform ? {
                                        id: link.platform.id,
                                        name: link.platform.name,
                                        code: link.platform.code
                                    } : null
                                }))
                            }));

                        return {
                            id: product.id,
                            title: product.title,
                            releaseDate: product.releaseDate,
                            releaseDateDisplay: product.releaseDateDisplay,
                            description: product.description,
                            officialUrl: product.officialUrl,
                            seriesName: product.seriesName,
                            volumeNumber: product.volumeNumber,
                            volumeTitle: product.volumeTitle,
                            category: product.category ? {
                                id: product.category.id,
                                name: product.category.name,
                                code: product.category.code
                            } : null,
                            variants: variants,
                            workProductDescription: null // 直接関連のためnull
                        };
                    })
                    .sort((a, b) => {
                        // まずカテゴリ順、その後発売日順
                        const categoryOrder = (a.category?.code || 'zzz').localeCompare(b.category?.code || 'zzz');
                        if (categoryOrder !== 0) return categoryOrder;
                        
                        const dateA = a.releaseDate ? new Date(a.releaseDate) : new Date('9999-12-31');
                        const dateB = b.releaseDate ? new Date(b.releaseDate) : new Date('9999-12-31');
                        return dateB - dateA; // 新しい順
                    });

                // 関連動画を取得
                const { data: relatedVideos, error: videosError } = await supabase
                    .from('videos')
                    .select(`
                        id,
                        title,
                        video_url,
                        published_at
                    `)
                    .eq('work_id', id)
                    .order('published_at', { ascending: false })
                    .limit(5);

                if (videosError) {
                    console.warn('関連動画取得エラー:', videosError);
                }

                // 関連動画を整形
                const formattedVideos = (relatedVideos || []).map(video => {
                    const publishedDate = new Date(video.published_at);
                    const formattedDate = `${publishedDate.getFullYear()}.${String(publishedDate.getMonth() + 1).padStart(2, '0')}.${String(publishedDate.getDate()).padStart(2, '0')}`;
                    
                    return {
                        id: video.id,
                        title: video.title,
                        videoUrl: video.video_url,
                        publishedAt: video.published_at,
                        formattedDate: formattedDate
                    };
                });

                // レスポンス形式
                const response = {
                    id: work.id,
                    title: work.title,
                    titleReading: null,
                    workType: 'other',
                    mediaType: null,
                    mediaTypeDetail: null,
                    category: work.category,
                    categoryName: work.category?.name,
                    officialUrl: work.official_url,
                    description: work.description,
                    broadcastPeriod: work.year ? `${work.year}年` : null,
                    productionYear: work.year,
                    season: null,
                    isNew: false,
                    isRebroadcast: false,
                    broadcastTime: null,
                    broadcastDayOfWeek: null,
                    broadcastStation: work.broadcastChannels && work.broadcastChannels.length > 0 
                        ? work.broadcastChannels.map(bc => bc.station?.name).filter(Boolean).join('、')
                        : null,
                    broadcastStations: work.broadcastChannels && work.broadcastChannels.length > 0 
                        ? work.broadcastChannels.map(bc => bc.station?.name).filter(Boolean)
                        : [],
                    productionCompany: null,
                    performers: performers,
                    staff: staffByRole,
                    songs: [],
                    relatedProducts: formattedProducts,
                    relatedVideos: formattedVideos
                };

                return res.status(200).json({
                    success: true,
                    data: response
                });
            } else {
                // 既存の簡易情報取得
                const { data: work, error } = await supabase
                    .from('works')
                    .select(`
                        id, 
                        title, 
                        category_id,
                        year,
                        description, 
                        official_url,
                        category:category_id (id, name)
                    `)
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('作品取得エラー:', error);
                    throw error;
                }

                if (!work) {
                    return res.status(404).json({
                        success: false,
                        message: '指定された作品が見つかりません'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: work
                });
            }
        } catch (error) {
            console.error('作品取得エラー:', error);
            return res.status(500).json({
                success: false,
                message: '作品の取得に失敗しました',
                error: error.message
            });
        }
    }
    // PUT: 作品更新
    else if (req.method === 'PUT') {
        const { title, categoryId, year, description, officialUrl } = req.body;

        // バリデーション
        if (!title || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'タイトルとカテゴリは必須項目です'
            });
        }

        try {
            // 作品データを更新
            const { data: updatedWork, error } = await supabase
                .from('works')
                .update({
                    title,
                    category_id: categoryId,
                    year: year ? parseInt(year) : null,
                    description: description || null,
                    official_url: officialUrl || null
                })
                .eq('id', id)
                .select();

            if (error) {
                console.error('作品更新エラー:', error);
                throw error;
            }

            return res.status(200).json({
                success: true,
                data: updatedWork[0],
                message: '作品が正常に更新されました'
            });
        } catch (error) {
            console.error('作品更新エラー:', error);
            return res.status(500).json({
                success: false,
                message: '作品の更新に失敗しました',
                error: error.message
            });
        }
    }
    // DELETE: 作品削除
    else if (req.method === 'DELETE') {
        try {
            // まず、関連するデータがないかチェック
            const { data: workRoles, error: rolesError } = await supabase
                .from('rel_work_roles')
                .select('id')
                .eq('work_id', id);

            if (rolesError) throw rolesError;

            // 関連するロールがある場合、先にそれらを削除
            if (workRoles && workRoles.length > 0) {
                const { error: deleteRolesError } = await supabase
                    .from('rel_work_roles')
                    .delete()
                    .eq('work_id', id);

                if (deleteRolesError) throw deleteRolesError;
            }

            // 放送情報がある場合は削除
            const { data: broadcastChannels, error: channelsError } = await supabase
                .from('rel_broadcast_channels')
                .select('id')
                .eq('work_id', id);

            if (channelsError) throw channelsError;

            if (broadcastChannels && broadcastChannels.length > 0) {
                const { error: deleteChannelsError } = await supabase
                    .from('rel_broadcast_channels')
                    .delete()
                    .eq('work_id', id);

                if (deleteChannelsError) throw deleteChannelsError;
            }

            // 作品自体を削除
            const { error: deleteWorkError } = await supabase
                .from('works')
                .delete()
                .eq('id', id);

            if (deleteWorkError) throw deleteWorkError;

            return res.status(200).json({
                success: true,
                message: '作品が正常に削除されました'
            });
        } catch (error) {
            console.error('作品削除エラー:', error);
            return res.status(500).json({
                success: false,
                message: '作品の削除に失敗しました',
                error: error.message
            });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}