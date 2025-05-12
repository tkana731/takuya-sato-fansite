import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function WeekdaysAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [weekdays, setWeekdays] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentWeekday, setCurrentWeekday] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 曜日データの取得
    useEffect(() => {
        const fetchWeekdays = async () => {
            try {
                setDataLoading(true);

                // 曜日データを取得
                const { data, error } = await supabase
                    .from('mst_weekdays')
                    .select('*')
                    .order('display_order', { ascending: true });

                if (error) throw error;

                setWeekdays(data || []);
            } catch (error) {
                console.error('曜日データの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchWeekdays();
    }, []);

    // 曜日削除
    const handleDelete = async (id) => {
        try {
            // 関連データの確認
            const { count, error: countError } = await supabase
                .from('rel_broadcast_channels')
                .select('id', { count: 'exact', head: true })
                .eq('weekday_id', id);

            if (countError) throw countError;

            if (count > 0) {
                alert(`この曜日は${count}件の放送情報で使用されているため削除できません。`);
                return;
            }

            // 曜日の削除
            const { error } = await supabase
                .from('mst_weekdays')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setWeekdays(weekdays.filter(weekday => weekday.id !== id));
        } catch (error) {
            console.error('曜日削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // 曜日追加
    const handleAdd = async (values) => {
        setIsSubmitting(true);
        try {
            // 最大の表示順を取得
            const maxOrder = weekdays.reduce((max, weekday) => Math.max(max, weekday.display_order || 0), 0);

            // 曜日を追加
            const { data, error } = await supabase
                .from('mst_weekdays')
                .insert([{
                    name: values.name,
                    short_name: values.shortName || null,
                    display_order: maxOrder + 1
                }])
                .select();

            if (error) throw error;

            // 成功時は一覧に追加
            setWeekdays([...weekdays, data[0]]);
            setShowAddForm(false);
        } catch (error) {
            console.error('曜日追加エラー:', error);
            alert('追加処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 曜日編集
    const handleEdit = async (values) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('mst_weekdays')
                .update({
                    name: values.name,
                    short_name: values.shortName || null
                })
                .eq('id', currentWeekday.id)
                .select();

            if (error) throw error;

            // 成功時は一覧を更新
            setWeekdays(weekdays.map(weekday =>
                weekday.id === currentWeekday.id ? data[0] : weekday
            ));
            setShowEditForm(false);
        } catch (error) {
            console.error('曜日編集エラー:', error);
            alert('編集処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 表示順の更新
    const handleMoveUp = async (id) => {
        const index = weekdays.findIndex(weekday => weekday.id === id);
        if (index <= 0) return; // 既に最上部

        try {
            const currentWeekday = weekdays[index];
            const prevWeekday = weekdays[index - 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_weekdays')
                .update({ display_order: prevWeekday.display_order })
                .eq('id', currentWeekday.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_weekdays')
                .update({ display_order: currentWeekday.display_order })
                .eq('id', prevWeekday.id);

            if (error2) throw error2;

            // 表示順を更新
            const newWeekdays = [...weekdays];
            newWeekdays[index] = prevWeekday;
            newWeekdays[index - 1] = currentWeekday;
            setWeekdays(newWeekdays);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    const handleMoveDown = async (id) => {
        const index = weekdays.findIndex(weekday => weekday.id === id);
        if (index >= weekdays.length - 1) return; // 既に最下部

        try {
            const currentWeekday = weekdays[index];
            const nextWeekday = weekdays[index + 1];

            // 順番を入れ替え
            const { error: error1 } = await supabase
                .from('mst_weekdays')
                .update({ display_order: nextWeekday.display_order })
                .eq('id', currentWeekday.id);

            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from('mst_weekdays')
                .update({ display_order: currentWeekday.display_order })
                .eq('id', nextWeekday.id);

            if (error2) throw error2;

            // 表示順を更新
            const newWeekdays = [...weekdays];
            newWeekdays[index] = nextWeekday;
            newWeekdays[index + 1] = currentWeekday;
            setWeekdays(newWeekdays);
        } catch (error) {
            console.error('順番更新エラー:', error);
            alert('順番の更新中にエラーが発生しました: ' + error.message);
        }
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'name',
            label: '曜日名',
            type: 'text',
            required: true,
            placeholder: '曜日名を入力（例: 月曜日）',
            span: 'sm:col-span-4',
        },
        {
            name: 'shortName',
            label: '短縮名',
            type: 'text',
            placeholder: '短縮名を入力（例: 月）',
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
                <title>曜日管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">曜日管理</h1>
                    <p className="text-gray-600">曜日の一覧を管理します</p>
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
                            title="新規曜日追加"
                            submitButtonText="曜日を追加"
                            cancelHref="#"
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                )}

                {showEditForm && currentWeekday && (
                    <div className="mb-8">
                        <FormBuilder
                            fields={formFields}
                            initialValues={{
                                name: currentWeekday.name,
                                shortName: currentWeekday.short_name || ''
                            }}
                            onSubmit={handleEdit}
                            title="曜日編集"
                            submitButtonText="曜日を更新"
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
                            新規曜日追加
                        </button>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">曜日一覧</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        表示順
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        曜日名
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        短縮名
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
                                {weekdays.map((weekday, index) => (
                                    <tr key={weekday.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {weekday.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {weekday.short_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleMoveUp(weekday.id)}
                                                    disabled={index === 0}
                                                    className={`p-1 rounded ${index === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="上に移動"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => handleMoveDown(weekday.id)}
                                                    disabled={index === weekdays.length - 1}
                                                    className={`p-1 rounded ${index === weekdays.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="下に移動"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentWeekday(weekday);
                                                    setShowEditForm(true);
                                                    setShowAddForm(false);
                                                }}
                                                className="text-primary hover:text-primary-dark mr-4"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(weekday.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {weekdays.length === 0 && (
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
                        {weekdays.length}件
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}