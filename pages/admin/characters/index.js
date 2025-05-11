// pages/admin/characters/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';

export default function CharactersAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [characters, setCharacters] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [filterBirthday, setFilterBirthday] = useState('all'); // 'all', 'with', 'without'

    // キャラクターデータの取得
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                setDataLoading(true);

                // すべてのキャラクターを取得
                const { data, error } = await supabase
                    .from('mst_roles')
                    .select(`
                        id, 
                        name, 
                        birthday,
                        series_name,
                        actor:actor_id (id, name)
                    `)
                    .order('name', { ascending: true });

                if (error) throw error;

                // データを整形
                const formattedCharacters = data.map(character => {
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
                });

                setCharacters(formattedCharacters);
            } catch (error) {
                console.error('キャラクターデータの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    // フィルター適用済みのキャラクターリストを取得
    const filteredCharacters = characters.filter(character => {
        if (filterBirthday === 'all') return true;
        if (filterBirthday === 'with') return character.hasBirthday;
        if (filterBirthday === 'without') return !character.hasBirthday;
        return true;
    });

    // キャラクター削除
    const handleDelete = async (id) => {
        try {
            // キャラクターが作品に関連付けられていないかチェック
            const { data: relatedWorks, error: checkError } = await supabase
                .from('rel_work_roles')
                .select('id')
                .eq('role_id', id);

            if (checkError) throw checkError;

            // 関連付けがある場合は削除不可
            if (relatedWorks && relatedWorks.length > 0) {
                alert(`このキャラクターは${relatedWorks.length}件の作品に関連付けられているため削除できません。先に関連を解除してください。`);
                return;
            }

            // キャラクターを削除
            const { error } = await supabase
                .from('mst_roles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setCharacters(characters.filter(character => character.id !== id));
        } catch (error) {
            console.error('キャラクター削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

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

    if (loading || dataLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="loading-spinner"></div>
                    <p className="ml-2">読み込み中...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head>
                <title>キャラクター管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">キャラクター管理</h1>
                    <p className="text-gray-600">
                        佐藤拓也さんが演じるキャラクターの情報を管理します。誕生日が設定されていると、その日にトップページに表示されます。
                    </p>
                </div>

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
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
}