import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // キャラクターデータを取得（中間テーブル経由）
        const { data: characters, error } = await supabase
            .from('mst_roles')
            .select(`
                id,
                name,
                birthday,
                height,
                series_name,
                rel_work_roles (
                    work_id,
                    is_main_role,
                    works (
                        id,
                        title,
                        category_id,
                        mst_work_categories (
                            name,
                            display_order
                        )
                    )
                )
            `)
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabaseエラー:', error);
            throw error;
        }

        // データを整形（誕生日カレンダー用に重複を避ける）
        const formattedCharacters = [];
        const processedCharacters = new Set(); // 重複チェック用
        
        characters.forEach(character => {
            // 同じキャラクター名の重複を避ける（誕生日カレンダー用）
            if (!processedCharacters.has(character.name)) {
                processedCharacters.add(character.name);
                
                formattedCharacters.push({
                    id: character.id,
                    name: character.name,
                    birthday: character.birthday,
                    height: character.height,
                    seriesName: character.series_name || null, // series_nameを使用
                    // 以下は互換性のため残す（他のページで使用している可能性）
                    mediaType: character.rel_work_roles?.[0]?.works?.mst_work_categories?.name || null,
                    mediaTypeOrder: character.rel_work_roles?.[0]?.works?.mst_work_categories?.display_order || 999,
                    workId: character.rel_work_roles?.[0]?.works?.id || null,
                    workTitle: character.rel_work_roles?.[0]?.works?.title || null,
                    isMainRole: character.rel_work_roles?.[0]?.is_main_role || false
                });
            }
        });

        res.status(200).json(formattedCharacters);
    } catch (error) {
        console.error('キャラクターデータ取得エラー:', error);
        res.status(500).json({ 
            error: 'キャラクターデータの取得に失敗しました',
            details: error.message 
        });
    }
}