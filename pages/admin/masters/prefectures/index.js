import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function PrefecturesAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [prefectures, setPrefectures] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentPrefecture, setCurrentPrefecture] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 都道府県データの取得
    useEffect(() => {
        const fetchPrefectures = async () => {
            try {
                setDataLoading(true);

                // 都道府県データを取得
                const { data, error } = await supabase
                    .from('mst_prefectures')
                    .select('*')
                    .order('display_order', { ascending: true });

                if (error) throw error;

                setPrefectures(data || []);
            } catch (error) {
                console.error('都道府県データの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchPrefectures();
    }, []);

    // 都道府県削除
    const handleDelete = async (id) => {
        try {
            // 関連データの確認
            const { count, error: countError } = await supabase
                .from('mst_venues')
                .select('id', { count: 'exact', head: true })
                .eq('prefecture_id', id);

            if (countError) throw countError;

            if (count > 0) {
                alert(`この都道府県は${count}件の会場で使用されているため削除できません。`);
                return;
            }

            // 都道府県の削除
            const { error } = await supabase
                .from('mst_prefectures')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setPrefectures(prefectures.filter(prefecture => prefecture.id !== id));
        } catch (error) {
            console.error('都道府県削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // 都道府県追加
    const handleAdd = async (values) => {
        setIsSubmitting(true);
        try {
            // 最大の表示順を取得
            const maxOrder = prefectures.reduce((max, prefecture) => Math.max(max, prefecture.display_order || 0), 0);

            // 都道府県を追加
            const { data, error } = await supabase
                .from('mst_prefectures')
                .insert([{
                    name: values.name,
                    region: values.region || null,
                    display_order: maxOrder + 1
                }])
                .select();

            if (error) throw error;

            // 成功時は一覧に追加
            setPrefectures([...prefectures, data[0]]);
            setShowAddForm(false);
        } catch (error) {
            console.error('都道府県追加エラー:', error);
            alert('追加処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 都道府県編集
    const handleEdit = async (values) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('mst_prefectures')
                .update({
                    name: values.name,
                    region: values.region || null
                })
                .eq('id', currentPrefecture.id)
                .select();

            if (error) throw error;

            // 成功時は一覧を更新
            setPrefectures(prefectures.map(prefecture =>
                prefecture.id === currentPrefecture.id ? data[0] : prefecture
            ));
            setShowEditForm(false);
        } catch (error) {
            console.error('都道府県編集エラー:', error);
            alert('編集処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 表示順の更新
    const handleMoveUp = async (id) => {
        const index = prefectures.findIndex(prefecture => prefecture.id === id);
        if (index <= 0) return; // 既に最上部

        try {
            const currentPrefecture = prefectures[index];
            const prevPrefecture = prefectures[index - 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_prefectures')
                .update({ display_order: prevPrefecture.display_order })
                .eq('id', currentPrefecture.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_prefectures')
                .update({ display_order: currentPrefecture.display_order })
                .eq('id', prevPrefecture.id);

            if (error2) throw error2;

            // 表示順を更新
            const newPrefectures = [...prefectures];
            newPrefectures[index] = prevPrefecture;
            newPrefectures[index - 1] = currentPrefecture;
            setPrefectures(newPrefectures);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    const handleMoveDown = async (id) => {
        const index = prefectures.findIndex(prefecture => prefecture.id === id);
        if (index >= prefectures.length - 1) return; // 既に最下部

        try {
            const currentPrefecture = prefectures[index];
            const nextPrefecture = prefectures[index + 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_prefectures')
                .update({ display_order: nextPrefecture.display_order })
                .eq('id', currentPrefecture.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_prefectures')
                .update({ display_order: currentPrefecture.display_order })
                .eq('id', nextPrefecture.id);

            if (error2) throw error2;

            // 表示順を更新
            const newPrefectures = [...prefectures];
            newPrefectures[index] = nextPrefecture;
            newPrefectures[index + 1] = currentPrefecture;
            setPrefectures(newPrefectures);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'name',
            label: '都道府県名',
            type: 'text',
            required: true,
            placeholder: '都道府県名を入力',
            span: 'sm:col-span-4',
        },
        {
            name: 'region',
            label: '地方',
            type: 'select',
            options: [
                { value: '北海道・東北', label: '北海道・東北' },
                { value: '関東', label: '関東' },
                { value: '中部', label: '中部' },
                { value: '近畿', label: '近畿' },
                { value: '中国・四国', label: '中国・四国' },
                { value: '九州・沖縄', label: '九州・沖縄' }
            ],
            placeholder: '地方を選択',
            span: 'sm:col-span-2',
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
                <title>都道府県管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">都道府県管理</h1>
                    <p className="text-gray-600">都道府県の一覧を管理します</p>
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
                            title="新規都道府県追加"
                            submitButtonText="都道府県を追加"
                            cancelHref="#"
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                )}

                {showEditForm && currentPrefecture && (
                    <div className="mb-8">
                        <FormBuilder
                            fields={formFields}
                            initialValues={{
                                name: currentPrefecture.name,
                                region: currentPrefecture.region || ''
                            }}
                            onSubmit={handleEdit}
                            title="都道府県編集"
                            submitButtonText="都道府県を更新"
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
                            新規都道府県追加
                        </button>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">都道府県一覧</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        表示順
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        都道府県名
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        地方
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
                                {prefectures.map((prefecture, index) => (
                                    <tr key={prefecture.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {prefecture.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {prefecture.region || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleMoveUp(prefecture.id)}
                                                    disabled={index === 0}
                                                    className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="上に移動"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => handleMoveDown(prefecture.id)}
                                                    disabled={index === prefectures.length - 1}
                                                    className={`p-1 rounded ${index === prefectures.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="下に移動"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentPrefecture(prefecture);
                                                    setShowEditForm(true);
                                                    setShowAddForm(false);
                                                }}
                                                className="text-primary hover:text-primary-dark mr-4"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(prefecture.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {prefectures.length === 0 && (
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
                        {prefectures.length}件
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}