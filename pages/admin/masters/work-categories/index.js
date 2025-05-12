import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function WorkCategoriesAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [categories, setCategories] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // カテゴリデータの取得
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setDataLoading(true);

                // カテゴリデータを取得
                const { data, error } = await supabase
                    .from('mst_work_categories')
                    .select('*')
                    .order('display_order', { ascending: true });

                if (error) throw error;

                setCategories(data || []);
            } catch (error) {
                console.error('カテゴリデータの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // カテゴリ削除
    const handleDelete = async (id) => {
        try {
            // 関連データの確認
            const { count, error: countError } = await supabase
                .from('works')
                .select('id', { count: 'exact', head: true })
                .eq('category_id', id);

            if (countError) throw countError;

            if (count > 0) {
                alert(`このカテゴリは${count}件の作品で使用されているため削除できません。`);
                return;
            }

            // カテゴリの削除
            const { error } = await supabase
                .from('mst_work_categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setCategories(categories.filter(category => category.id !== id));
        } catch (error) {
            console.error('カテゴリ削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // カテゴリ追加
    const handleAdd = async (values) => {
        setIsSubmitting(true);
        try {
            // 最大の表示順を取得
            const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.display_order || 0), 0);

            // カテゴリを追加
            const { data, error } = await supabase
                .from('mst_work_categories')
                .insert([{
                    name: values.name,
                    description: values.description || null,
                    display_order: maxOrder + 1
                }])
                .select();

            if (error) throw error;

            // 成功時は一覧に追加
            setCategories([...categories, data[0]]);
            setShowAddForm(false);
        } catch (error) {
            console.error('カテゴリ追加エラー:', error);
            alert('追加処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // カテゴリ編集
    const handleEdit = async (values) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('mst_work_categories')
                .update({
                    name: values.name,
                    description: values.description || null
                })
                .eq('id', currentCategory.id)
                .select();

            if (error) throw error;

            // 成功時は一覧を更新
            setCategories(categories.map(cat =>
                cat.id === currentCategory.id ? data[0] : cat
            ));
            setShowEditForm(false);
        } catch (error) {
            console.error('カテゴリ編集エラー:', error);
            alert('編集処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 表示順の更新
    const handleMoveUp = async (id) => {
        const index = categories.findIndex(cat => cat.id === id);
        if (index <= 0) return; // 既に最上部

        try {
            const currentCategory = categories[index];
            const prevCategory = categories[index - 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_work_categories')
                .update({ display_order: prevCategory.display_order })
                .eq('id', currentCategory.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_work_categories')
                .update({ display_order: currentCategory.display_order })
                .eq('id', prevCategory.id);

            if (error2) throw error2;

            // 表示順を更新
            const newCategories = [...categories];
            newCategories[index] = prevCategory;
            newCategories[index - 1] = currentCategory;
            setCategories(newCategories);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    const handleMoveDown = async (id) => {
        const index = categories.findIndex(cat => cat.id === id);
        if (index >= categories.length - 1) return; // 既に最下部

        try {
            const currentCategory = categories[index];
            const nextCategory = categories[index + 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_work_categories')
                .update({ display_order: nextCategory.display_order })
                .eq('id', currentCategory.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_work_categories')
                .update({ display_order: currentCategory.display_order })
                .eq('id', nextCategory.id);

            if (error2) throw error2;

            // 表示順を更新
            const newCategories = [...categories];
            newCategories[index] = nextCategory;
            newCategories[index + 1] = currentCategory;
            setCategories(newCategories);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'name',
            label: 'カテゴリ名',
            type: 'text',
            required: true,
            placeholder: 'カテゴリ名を入力',
            span: 'sm:col-span-6',
        },
        {
            name: 'description',
            label: '説明',
            type: 'textarea',
            placeholder: 'カテゴリの説明',
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
                <title>作品カテゴリ管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">作品カテゴリ管理</h1>
                    <p className="text-gray-600">アニメ、ゲーム、吹き替えなどの作品カテゴリを管理します</p>
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
                            title="新規カテゴリ追加"
                            submitButtonText="カテゴリを追加"
                            cancelHref="#"
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                )}

                {showEditForm && currentCategory && (
                    <div className="mb-8">
                        <FormBuilder
                            fields={formFields}
                            initialValues={{
                                name: currentCategory.name,
                                description: currentCategory.description || ''
                            }}
                            onSubmit={handleEdit}
                            title="カテゴリ編集"
                            submitButtonText="カテゴリを更新"
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
                            新規カテゴリ追加
                        </button>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">カテゴリ一覧</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        表示順
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        カテゴリ名
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
                                {categories.map((category, index) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleMoveUp(category.id)}
                                                    disabled={index === 0}
                                                    className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="上に移動"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => handleMoveDown(category.id)}
                                                    disabled={index === categories.length - 1}
                                                    className={`p-1 rounded ${index === categories.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="下に移動"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentCategory(category);
                                                    setShowEditForm(true);
                                                    setShowAddForm(false);
                                                }}
                                                className="text-primary hover:text-primary-dark mr-4"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
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
                        {categories.length}件
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}