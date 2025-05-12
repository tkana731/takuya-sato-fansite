import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function StationTypesAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [types, setTypes] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentType, setCurrentType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 放送局タイプデータの取得
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                setDataLoading(true);

                // 放送局タイプデータを取得
                const { data, error } = await supabase
                    .from('mst_station_types')
                    .select('*')
                    .order('display_order', { ascending: true });

                if (error) throw error;

                setTypes(data || []);
            } catch (error) {
                console.error('放送局タイプデータの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchTypes();
    }, []);

    // 放送局タイプ削除
    const handleDelete = async (id) => {
        try {
            // 関連データの確認
            const { count, error: countError } = await supabase
                .from('mst_broadcast_stations')
                .select('id', { count: 'exact', head: true })
                .eq('type_id', id);

            if (countError) throw countError;

            if (count > 0) {
                alert(`このタイプは${count}件の放送局で使用されているため削除できません。`);
                return;
            }

            // 放送局タイプの削除
            const { error } = await supabase
                .from('mst_station_types')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setTypes(types.filter(type => type.id !== id));
        } catch (error) {
            console.error('放送局タイプ削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // 放送局タイプ追加
    const handleAdd = async (values) => {
        setIsSubmitting(true);
        try {
            // 最大の表示順を取得
            const maxOrder = types.reduce((max, type) => Math.max(max, type.display_order || 0), 0);

            // 放送局タイプを追加
            const { data, error } = await supabase
                .from('mst_station_types')
                .insert([{
                    name: values.name,
                    description: values.description || null,
                    display_order: maxOrder + 1
                }])
                .select();

            if (error) throw error;

            // 成功時は一覧に追加
            setTypes([...types, data[0]]);
            setShowAddForm(false);
        } catch (error) {
            console.error('放送局タイプ追加エラー:', error);
            alert('追加処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 放送局タイプ編集
    const handleEdit = async (values) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('mst_station_types')
                .update({
                    name: values.name,
                    description: values.description || null
                })
                .eq('id', currentType.id)
                .select();

            if (error) throw error;

            // 成功時は一覧を更新
            setTypes(types.map(type =>
                type.id === currentType.id ? data[0] : type
            ));
            setShowEditForm(false);
        } catch (error) {
            console.error('放送局タイプ編集エラー:', error);
            alert('編集処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 表示順の更新
    const handleMoveUp = async (id) => {
        const index = types.findIndex(type => type.id === id);
        if (index <= 0) return; // 既に最上部

        try {
            const currentType = types[index];
            const prevType = types[index - 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_station_types')
                .update({ display_order: prevType.display_order })
                .eq('id', currentType.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_station_types')
                .update({ display_order: currentType.display_order })
                .eq('id', prevType.id);

            if (error2) throw error2;

            // 表示順を更新
            const newTypes = [...types];
            newTypes[index] = prevType;
            newTypes[index - 1] = currentType;
            setTypes(newTypes);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    const handleMoveDown = async (id) => {
        const index = types.findIndex(type => type.id === id);
        if (index >= types.length - 1) return; // 既に最下部

        try {
            const currentType = types[index];
            const nextType = types[index + 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_station_types')
                .update({ display_order: nextType.display_order })
                .eq('id', currentType.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_station_types')
                .update({ display_order: currentType.display_order })
                .eq('id', nextType.id);

            if (error2) throw error2;

            // 表示順を更新
            const newTypes = [...types];
            newTypes[index] = nextType;
            newTypes[index + 1] = currentType;
            setTypes(newTypes);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'name',
            label: 'タイプ名',
            type: 'text',
            required: true,
            placeholder: 'タイプ名を入力',
            span: 'sm:col-span-6',
        },
        {
            name: 'description',
            label: '説明',
            type: 'textarea',
            placeholder: 'タイプの説明',
            span: 'sm:col-span-6',
            rows: 3
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
                <title>放送局タイプ管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">放送局タイプ管理</h1>
                    <p className="text-gray-600">テレビ局、ラジオ局、配信サイトなどの放送局タイプを管理します</p>
                    <div className="mt-2">
                        <Link href="/admin/masters" className="text-accent hover:underline">
                            ← マスタデータ管理に戻る
                        </Link>
                    </div>
                </div>

                {showAddForm && (
                    <div className="mb-8">
                        <FormBuilder
                            fields={formFields}
                            onSubmit={handleAdd}
                            title="新規放送局タイプ追加"
                            submitButtonText="タイプを追加"
                            cancelHref="#"
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                )}

                {showEditForm && currentType && (
                    <div className="mb-8">
                        <FormBuilder
                            fields={formFields}
                            initialValues={{
                                name: currentType.name,
                                description: currentType.description || ''
                            }}
                            onSubmit={handleEdit}
                            title="放送局タイプ編集"
                            submitButtonText="タイプを更新"
                            cancelHref="#"
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowEditForm(false)}
                        />
                    </div>
                )}

                {!showAddForm && !showEditForm && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                        >
                            新規放送局タイプ追加
                        </button>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">放送局タイプ一覧</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        表示順
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        タイプ名
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        説明
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        表示順変更
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {types.map((type, index) => (
                                    <tr key={type.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {type.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {type.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleMoveUp(type.id)}
                                                    disabled={index === 0}
                                                    className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="上に移動"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => handleMoveDown(type.id)}
                                                    disabled={index === types.length - 1}
                                                    className={`p-1 rounded ${index === types.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="下に移動"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentType(type);
                                                    setShowEditForm(true);
                                                    setShowAddForm(false);
                                                }}
                                                className="text-primary hover:text-primary-dark mr-4"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {types.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            データがありません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 text-gray-500 text-sm">
                        {types.length}件
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}