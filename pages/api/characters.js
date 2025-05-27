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

        // データを整形（複数の作品に出演している場合を考慮）
        const formattedCharacters = [];
        characters.forEach(character => {
            if (character.rel_work_roles && character.rel_work_roles.length > 0) {
                character.rel_work_roles.forEach(workRole => {
                    if (workRole.works) {
                        formattedCharacters.push({
                            id: `${character.id}-${workRole.work_id}`,
                            name: character.name,
                            birthday: character.birthday,
                            mediaType: workRole.works.mst_work_categories?.name || null,
                            mediaTypeOrder: workRole.works.mst_work_categories?.display_order || 999,
                            workId: workRole.works.id,
                            workTitle: workRole.works.title || null,
                            isMainRole: workRole.is_main_role
                        });
                    }
                });
            } else {
                // 作品が紐付いていないキャラクターも表示
                formattedCharacters.push({
                    id: character.id,
                    name: character.name,
                    birthday: character.birthday,
                    mediaType: null,
                    mediaTypeOrder: 999,
                    workId: null,
                    workTitle: null,
                    isMainRole: false
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