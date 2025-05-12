import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function ActorsAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [actors, setActors] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentActor, setCurrentActor] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 声優データの取得
    useEffect(() => {
        const fetchActors = async () => {
            try {
                setDataLoading(true);

                const { data, error } = await supabase
                    .from('mst_actors')
                    .select('*')
                    .order('name', { ascending: true });

                if (error) throw error;

                setActors(data || []);
            } catch (error) {
                console.error('声優データの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchActors();
    }, []);

    // 声優削除
    const handleDelete = async (id) => {
        try {
            // 関連データの確認（役割）
            const { count: rolesCount, error: rolesError } = await supabase
                .from('mst_roles')
                .select('id', { count: 'exact', head: true })
                .eq('actor_id', id);

            if (rolesError) throw rolesError;

            if (rolesCount > 0) {
                alert(`この声優は${rolesCount}件の役割で使用されているため削除できません。`);
                return;
            }

            // 声優の削除
            const { error } = await supabase
                .from('mst_actors')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setActors(actors.filter(actor => actor.id !== id));
        } catch (error) {
            console.error('声優削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // 声優追加
    const handleAdd = async (values) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('mst_actors')
                .insert([{
                    name: values.name,
                    name_kana: values.nameKana || null,
                    profile_url: values.profileUrl || null,
                    is_takuya_sato: values.isTakuyaSato || false
                }])
                .select();

            if (error) throw error;

            // 成功時は一覧に追加
            setActors([...actors, data[0]]);
            setShowAddForm(false);
        } catch (error) {
            console.error('声優追加エラー:', error);
            alert('追加処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 声優編集
    const handleEdit = async (values) => {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('mst_actors')
                .update({
                    name: values.name,
                    name_kana: values.nameKana || null,
                    profile_url: values.profileUrl || null,
                    is_takuya_sato: values.isTakuyaSato || false
                })
                .eq('id', currentActor.id)
                .select();

            if (error) throw error;

            // 成功時は一覧を更新
            setActors(actors.map(actor =>
                actor.id === currentActor.id ? data[0] : actor
            ));
            setShowEditForm(false);
        } catch (error) {
            console.error('声優編集エラー:', error);
            alert('編集処理中にエラーが発生しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'name',
            label: '名前',
            type: 'text',
            required: true,
            placeholder: '名前を入力',
            span: 'sm:col-span-3',
        },
        {
            name: 'nameKana',
            label: '名前（カナ）',
            type: 'text',
            placeholder: '名前をカナで入力',
            span: 'sm:col-span-3',
        },
        {
            name: 'profileUrl',
            label: 'プロフィールURL',
            type: 'text',
            placeholder: 'https://example.com',
            span: 'sm:col-span-6',
        },
        {
            name: 'isTakuyaSato',
            label: '佐藤拓也',
            type: 'checkbox',
            checkboxLabel: '佐藤拓也である（このチェックは佐藤拓也のみにしてください）',
            span: 'sm:col-span-6',
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
                <title>声優管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">声優管理</h1>
                    <p className="text-gray-600">声優情報を管理します</p>
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
                            title="新規声優追加"
                            submitButtonText="声優を追加"
                            cancelHref="#"
                            isSubmitting={isSubmitting}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                )}

                {showEditForm && currentActor && (
                    <div className="mb-8">
                        <FormBuilder
                            fields={formFields}
                            initialValues={{
                                name: currentActor.name,
                                nameKana: currentActor.name_kana || '',
                                profileUrl: currentActor.profile_url || '',
                                isTakuyaSato: currentActor.is_takuya_sato || false
                            }}
                            onSubmit={handleEdit}
                            title="声優編集"
                            submitButtonText="声優を更新"
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
                            新規声優追加
                        </button>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">声優一覧</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        名前
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        名前（カナ）
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        佐藤拓也
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        プロフィールURL
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {actors.map((actor) => (
                                    <tr key={actor.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {actor.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {actor.name_kana || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {actor.is_takuya_sato ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    はい
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    いいえ
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {actor.profile_url ? (
                                                <a
                                                    href={actor.profile_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    リンク
                                                </a>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setCurrentActor(actor);
                                                    setShowEditForm(true);
                                                    setShowAddForm(false);
                                                }}
                                                className="text-primary hover:text-primary-dark mr-4"
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(actor.id)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={actor.is_takuya_sato} // 佐藤拓也は削除不可
                                                title={actor.is_takuya_sato ? "佐藤拓也は削除できません" : ""}
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {actors.length === 0 && (
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
                        {actors.length}件
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}