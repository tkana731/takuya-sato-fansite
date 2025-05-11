// pages/admin/roles/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';

export default function RolesAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [roles, setRoles] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 役割データの取得
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setDataLoading(true);

                // 役割データを取得
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
                const formattedRoles = data.map(role => {
                    return {
                        id: role.id,
                        name: role.name,
                        actorName: role.actor?.name || '-',
                        seriesName: role.series_name || '-',
                        birthday: role.birthday || '-'
                    };
                });

                setRoles(formattedRoles);
            } catch (error) {
                console.error('役割データの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchRoles();
    }, []);

    // 役割削除
    const handleDelete = async (id) => {
        try {
            // 役割が作品に関連付けられていないかチェック
            const { data: relatedWorks, error: checkError } = await supabase
                .from('rel_work_roles')
                .select('id')
                .eq('role_id', id);

            if (checkError) throw checkError;

            // 関連付けがある場合は削除不可
            if (relatedWorks && relatedWorks.length > 0) {
                alert(`この役割は${relatedWorks.length}件の作品に関連付けられているため削除できません。先に関連を解除してください。`);
                return;
            }

            // 役割を削除
            const { error } = await supabase
                .from('mst_roles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setRoles(roles.filter(role => role.id !== id));
        } catch (error) {
            console.error('役割削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // テーブルのカラム定義
    const columns = [
        {
            key: 'name',
            label: '役割名',
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
            key: 'birthday',
            label: '誕生日',
            render: (item) => {
                if (item.birthday === '-') return '-';

                // MM/DD形式を「M月D日」に変換
                const parts = item.birthday.split('/');
                if (parts.length === 2) {
                    const month = parseInt(parts[0]);
                    const day = parseInt(parts[1]);
                    return `${month}月${day}日`;
                }
                return item.birthday;
            }
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
                <title>役割管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">役割管理</h1>
                    <p className="text-gray-600">佐藤拓也さんの演じる役割（キャラクター）を管理します</p>
                </div>

                <DataTable
                    data={roles}
                    columns={columns}
                    title="役割一覧"
                    addButtonLink="/admin/roles/new"
                    addButtonText="新規役割追加"
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
}