// pages/admin/characters/index.js
import { useState } from 'react';
import { ListPage } from '../../../components/Admin/CommonCrud';
import DataTable from '../../../components/Admin/DataTable';
import { useDataFetching } from '../../../hooks/useDataFetching';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { checkRelatedData } from '../../../lib/api-helpers';

export default function CharactersAdmin() {
    // 管理者のみアクセス可能
    const { loading: authLoading } = useProtectedRoute(true);

    // フィルター状態
    const [filterBirthday, setFilterBirthday] = useState('all'); // 'all', 'with', 'without'

    // キャラクターデータ取得 (カスタムフック使用)
    const {
        data: characters,
        loading: dataLoading,
        handleDelete
    } = useDataFetching(
        'mst_roles',
        {
            select: `
        id, 
        name, 
        birthday,
        series_name,
        actor:actor_id (id, name)
      `,
            order: 'name'
        },
        // データ整形関数
        (data) => data.map(character => {
            // MM/DD形式を解析
            let month = '';
            let day = '';
            let formattedDate = '-';

            if (character.birthday) {
                const parts = character.birthday.split('/');
                if (parts.length === 2) {
                    month = parseInt(parts[0]);
                    day = parseInt(parts[1]);
                    formattedDate = `${month}月${day}日`;
                }
            }

            // ソート用に数値化した誕生日（1月1日→101, 12月31日→1231）
            let sortKey = 9999;
            if (character.birthday) {
                sortKey = parseInt(character.birthday.replace('/', ''));
            }

            return {
                id: character.id,
                name: character.name,
                actorName: character.actor?.name || '-',
                actorId: character.actor?.id || null,
                seriesName: character.series_name || '-',
                birthday: character.birthday || '-',
                formattedDate,
                sortKey,
                hasBirthday: !!character.birthday
            };
        })
    );

    // カスタム削除ハンドラ - 関連データをチェックしてから削除
    const handleCharacterDelete = async (id) => {
        try {
            // キャラクターが作品に関連付けられていないかチェック
            const { hasRelated, count } = await checkRelatedData('rel_work_roles', 'role_id', id);

            // 関連付けがある場合は削除不可
            if (hasRelated) {
                alert(`このキャラクターは${count}件の作品に関連付けられているため削除できません。先に関連を解除してください。`);
                return;
            }

            // 関連データがなければ削除実行
            await handleDelete(id);
        } catch (error) {
            console.error('キャラクター削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // フィルター適用済みのキャラクターリストを取得
    const filteredCharacters = characters.filter(character => {
        if (filterBirthday === 'all') return true;
        if (filterBirthday === 'with') return character.hasBirthday;
        if (filterBirthday === 'without') return !character.hasBirthday;
        return true;
    });

    // テーブルのカラム定義
    const columns = [
        {
            key: 'name',
            label: 'キャラクター名',
        },
        {
            key: 'seriesName',
            label: '作品/シリーズ',
        },
        {
            key: 'actorName',
            label: '声優',
        },
        {
            key: 'formattedDate',
            label: '誕生日',
            render: (item) => (
                <span className={item.hasBirthday ? 'text-primary font-medium' : 'text-gray-400'}>
                    {item.formattedDate}
                </span>
            )
        },
        {
            key: 'birthday',
            label: '日付形式',
            render: (item) => (
                item.hasBirthday ?
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{item.birthday}</code> :
                    <span className="text-gray-400">-</span>
            )
        }
    ];

    // データテーブルコンポーネント
    const dataTable = (
        <>
            {/* 誕生日フィルター */}
            <div className="mb-4 flex items-center space-x-4">
                <span className="text-sm font-medium">誕生日:</span>
                <div className="flex bg-white rounded-md shadow-sm p-1">
                    <button
                        className={`px-3 py-1 text-sm rounded-md ${filterBirthday === 'all' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setFilterBirthday('all')}
                    >
                        すべて
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded-md ${filterBirthday === 'with' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setFilterBirthday('with')}
                    >
                        誕生日あり
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded-md ${filterBirthday === 'without' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setFilterBirthday('without')}
                    >
                        誕生日なし
                    </button>
                </div>
            </div>

            <DataTable
                data={filteredCharacters}
                columns={columns}
                title="キャラクター一覧"
                addButtonLink="/admin/characters/new"
                addButtonText="新規キャラクター追加"
                onDelete={handleCharacterDelete}
            />
        </>
    );

    return (
        <ListPage
            title="キャラクター"
            description="佐藤拓也さんが演じるキャラクターの情報を管理します。誕生日が設定されていると、その日にトップページに表示されます。"
            dataTable={dataTable}
        />
    );
}