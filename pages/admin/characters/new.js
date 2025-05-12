// pages/admin/characters/new.js
import { useEffect, useState } from 'react';
import { CreatePage } from '../../../components/Admin/CommonCrud';
import { useMasterDataFetching } from '../../../hooks/useDataFetching';
import { validateBirthday } from '../../../lib/form-helpers';
import useProtectedRoute from '../../../hooks/useProtectedRoute';

export default function NewCharacter() {
    // 管理者のみアクセス可能
    const { loading: authLoading } = useProtectedRoute(true);

    // 声優データを取得
    const { masterData, loading: mastersLoading } = useMasterDataFetching({
        'mst_actors': {
            select: 'id, name',
            order: 'name'
        }
    });

    // フォームフィールド定義
    const [formFields, setFormFields] = useState([]);

    // マスターデータが取得できたらフォームフィールドを更新
    useEffect(() => {
        if (mastersLoading || !masterData.mst_actors) return;

        setFormFields([
            {
                name: 'name',
                label: 'キャラクター名',
                type: 'text',
                required: true,
                placeholder: 'キャラクターの名前を入力',
                span: 'sm:col-span-6',
            },
            {
                name: 'actorId',
                label: '声優',
                type: 'select',
                required: true,
                options: masterData.mst_actors.map(actor => ({
                    value: actor.id,
                    label: actor.name,
                })),
                span: 'sm:col-span-3',
                placeholder: '声優を選択',
                help: '通常は佐藤拓也を選択します'
            },
            {
                name: 'seriesName',
                label: '作品/シリーズ名',
                type: 'text',
                placeholder: '作品名かシリーズ名を入力（例: IDOLiSH7）',
                span: 'sm:col-span-3',
            },
            {
                name: 'birthday',
                label: '誕生日（任意）',
                type: 'text',
                placeholder: 'MM/DD形式で入力（例: 05/15）',
                span: 'sm:col-span-3',
                validate: validateBirthday,
                help: '誕生日は月/日の形式で入力してください。例: 1月1日→01/01, 12月25日→12/25'
            },
        ]);
    }, [masterData, mastersLoading]);

    // データ変換関数
    const transformData = (values) => ({
        name: values.name,
        actor_id: values.actorId,
        series_name: values.seriesName || null,
        birthday: values.birthday || null
    });

    return (
        <CreatePage
            title="キャラクター"
            description="佐藤拓也さんが演じる新しいキャラクターを追加します"
            tableName="mst_roles"
            apiEndpoint="/api/characters"
            formFields={formFields}
            transformData={transformData}
            redirectPath="/admin/characters"
        />
    );
}