// pages/admin/works/[id]/roles/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../../components/Admin/AdminLayout';
import useProtectedRoute from '../../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../../lib/supabase';

export default function WorkRoles() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const { id } = router.query;

    const [work, setWork] = useState(null);
    const [roles, setRoles] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [isMainRole, setIsMainRole] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 作品データと役割データの取得
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setDataLoading(true);
                setError('');

                // 作品データを取得
                const { data: workData, error: workError } = await supabase
                    .from('works')
                    .select(`
                        id, 
                        title,
                        category:category_id (id, name)
                    `)
                    .eq('id', id)
                    .single();

                if (workError) throw workError;

                // 作品に関連付けられた役割を取得
                const { data: rolesData, error: rolesError } = await supabase
                    .from('rel_work_roles')
                    .select(`
                        id,
                        role_id,
                        is_main_role,
                        role:mst_roles (
                            id,
                            name,
                            seriesName:series_name
                        )
                    `)
                    .eq('work_id', id)
                    .order('display_order', { ascending: true });

                if (rolesError) throw rolesError;

                // 全ての利用可能な役割を取得（役者が佐藤拓也のもの）
                const { data: allRolesData, error: allRolesError } = await supabase
                    .from('mst_roles')
                    .select(`
                        id,
                        name,
                        actor:actor_id (name),
                        series_name
                    `)
                    .eq('actor_id', '1')  // 佐藤拓也の役割のみを取得
                    .order('name');

                if (allRolesError) throw allRolesError;

                // データをセット
                setWork(workData);
                setRoles(rolesData);
                setAllRoles(allRolesData);

            } catch (error) {
                console.error('データの取得エラー:', error);
                setError('データの取得に失敗しました: ' + error.message);
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // 役割追加処理
    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!selectedRole) {
            setError('役割を選択してください');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // 役割の重複チェック
            const isDuplicate = roles.some(role => role.role_id === selectedRole);
            if (isDuplicate) {
                setError('この役割は既に追加されています');
                setIsSubmitting(false);
                return;
            }

            // 最大の表示順を取得
            const maxOrderRole = roles.reduce((max, role) => {
                return role.display_order > max ? role.display_order : max;
            }, 0);

            // 役割を追加
            const { data, error } = await supabase
                .from('rel_work_roles')
                .insert([
                    {
                        work_id: id,
                        role_id: selectedRole,
                        is_main_role: isMainRole,
                        display_order: maxOrderRole + 1
                    }
                ])
                .select(`
                    id,
                    role_id,
                    is_main_role,
                    display_order,
                    role:mst_roles (
                        id,
                        name,
                        seriesName:series_name
                    )
                `);

            if (error) throw error;

            // 成功メッセージを表示
            setSuccess('役割が正常に追加されました');

            // 役割リストを更新
            setRoles([...roles, ...data]);

            // フォームをリセット
            setSelectedRole('');
            setIsMainRole(false);

        } catch (error) {
            console.error('役割追加エラー:', error);
            setError('役割の追加に失敗しました: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 役割削除処理
    const handleDeleteRole = async (roleId) => {
        if (!confirm('この役割を削除してもよろしいですか？')) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            // 役割を削除
            const { error } = await supabase
                .from('rel_work_roles')
                .delete()
                .eq('id', roleId);

            if (error) throw error;

            // 成功メッセージを表示
            setSuccess('役割が正常に削除されました');

            // 役割リストを更新
            setRoles(roles.filter(role => role.id !== roleId));

        } catch (error) {
            console.error('役割削除エラー:', error);
            setError('役割の削除に失敗しました: ' + error.message);
        }
    };

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
                <title>作品役割管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">作品役割管理</h1>
                    <p className="text-gray-600">
                        {work?.title} ({work?.category?.name}) の役割を管理します
                    </p>
                    <div className="mt-2">
                        <Link href="/admin/works" className="text-accent hover:underline">
                            ← 作品一覧に戻る
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {success}
                    </div>
                )}

                {/* 役割一覧 */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">現在の役割一覧</h3>
                    </div>

                    <div className="p-4">
                        {roles.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                役割名
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                作品/シリーズ
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                タイプ
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                操作
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {roles.map((role) => (
                                            <tr key={role.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {role.role.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {role.role.seriesName || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {role.is_main_role ? (
                                                        <span className="px-2 py-1 bg-accent text-white text-xs rounded-full">
                                                            メイン役
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                            通常
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        削除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                まだ役割が登録されていません。下のフォームから追加してください。
                            </p>
                        )}
                    </div>
                </div>

                {/* 役割追加フォーム */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">役割を追加</h3>
                    </div>

                    <div className="p-4">
                        <form onSubmit={handleAddRole}>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                        役割
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            id="role"
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                                            disabled={isSubmitting}
                                        >
                                            <option value="">選択してください</option>
                                            {allRoles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name} {role.series_name ? `(${role.series_name})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        リストにない場合は、先に
                                        <Link href="/admin/roles/new" className="text-accent hover:underline">
                                            役割を追加
                                        </Link>
                                        してください。
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <div className="flex items-start pt-5">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="isMainRole"
                                                type="checkbox"
                                                checked={isMainRole}
                                                onChange={(e) => setIsMainRole(e.target.checked)}
                                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="isMainRole" className="font-medium text-gray-700">
                                                メイン役
                                            </label>
                                            <p className="text-gray-500">
                                                主要な役割の場合はチェック
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '追加中...' : '役割を追加'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}