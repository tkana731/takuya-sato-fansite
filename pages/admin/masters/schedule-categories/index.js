import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import DataTable from '../../../../components/Admin/DataTable';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function ScheduleCategoriesAdmin() {
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
                    .from('mst_schedule_categories')
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
                .from('schedules')
                .select('id', { count: 'exact', head: true })
                .eq('category_id', id);

            if (countError) throw countError;

            if (count > 0) {
                alert(`このカテゴリは${count}件のスケジュールで使用されているため削除できません。`);
                return;
            }

            // カテゴリの削除
            const { error } = await supabase
                .from('mst_schedule_categories')
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
                .from('mst_schedule_categories')
                .insert([{
                    name: values.name,
                    color_code: values.colorCode || '#000000',
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
                .from('mst_schedule_categories')
                .update({
                    name: values.name,
                    color_code: values.colorCode
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
                .from('mst_schedule_categories')
                .update({ display_order: prevCategory.display_order })
                .eq('id', currentCategory.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_schedule_categories')
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
                .from('mst_schedule_categories')
                .update({ display_order: nextCategory.display_order })
                .eq('id', currentCategory.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_schedule_categories')
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
            span: 'sm:col-span-4',
        },
        {
            name: 'colorCode',
            label: 'カラーコード',
            type: 'text',
            placeholder: '#000000',
            span: 'sm:col-span-2',
            help: '例: #FF0000（赤）、#00FF00（緑）、#0000FF（青）'
        }
    ];

    // テーブルのカラム定義
    const columns = [
        {
            key: 'display_order',
            label: '表示順',
            render: (item, index) => `${index + 1}`
        },
        {
            key: 'name',
            label: 'カテゴリ名',
        },
        {
            key: 'color_code',
            label: 'カラー',
            render: (item) => (
                <div className="flex items-center">
                    <div
                        className="w-6 h-6 rounded-full mr-2"
                        style={{ backgroundColor: item.color_code }}
                    ></div>
                    <span>{item.color_code}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: '表示順変更',
            render: (item, index) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleMoveUp(item.id)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                        title="上に移動"
                    >
                        ↑
                    </button>
                    <button
                        onClick={() => handleMoveDown(item.id)}
                        disabled={index === categories.length - 1}
                        className={`p-1 rounded ${index === categories.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                        title="下に移動"
                    >
                        ↓
                    </button>
                </div>
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
                <title>スケジュールカテゴリ管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">スケジュールカテゴリ管理</h1>
                    <p className="text-gray-600">イベント、舞台、生放送などのスケジュールカテゴリを管理します</p>
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
                                colorCode: currentCategory.color_code
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
                                    {columns.map((column) => (
                                        <th
                                            key={column.key}
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((category, index) => (
                                    <tr key={category.id}>
                                        {columns.map((column) => (
                                            <td key={`${category.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {column.render
                                                    ? column.render(category, index)
                                                    : category[column.key]}
                                            </td>
                                        ))}
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
                                        <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
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