// pages/admin/works/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/Admin/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';
import axios from 'axios';

export default function WorksAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [works, setWorks] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 作品データの取得
    useEffect(() => {
        const fetchWorks = async () => {
            try {
                setDataLoading(true);

                // カテゴリ情報を事前取得してマッピング
                const { data: categories, error: categoryError } = await supabase
                    .from('mst_work_categories')
                    .select('id, name');

                if (categoryError) throw categoryError;

                // カテゴリIDをキーとした連想配列を作成
                const categoryMap = {};
                categories.forEach(cat => {
                    categoryMap[cat.id] = cat;
                });

                // 作品データを取得
                const { data, error } = await supabase
                    .from('works')
                    .select(`
                        id, 
                        title, 
                        year,
                        description, 
                        official_url,
                        category:category_id (id, name),
                        workRoles:rel_work_roles(
                            is_main_role,
                            role:mst_roles(name)
                        )
                    `)
                    .order('year', { ascending: false });

                if (error) throw error;

                // データを整形
                const formattedWorks = data.map(work => {
                    // 出演役割の抽出
                    const roles = work.workRoles
                        .filter(wr => wr.role && wr.role.name)
                        .map(wr => ({
                            name: wr.role.name,
                            isMain: wr.is_main_role
                        }));

                    // メイン役割とその他の役割を分ける
                    const mainRoles = roles.filter(r => r.isMain).map(r => r.name);
                    const otherRoles = roles.filter(r => !r.isMain).map(r => r.name);

                    return {
                        id: work.id,
                        title: work.title,
                        year: work.year || '',
                        categoryName: work.category?.name || '',
                        mainRoles: mainRoles.join('、'),
                        otherRoles: otherRoles.join('、'),
                        roleCount: roles.length,
                        description: work.description || ''
                    };
                });

                setWorks(formattedWorks);
            } catch (error) {
                console.error('作品データの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchWorks();
    }, []);

    // 作品削除
    const handleDelete = async (id) => {
        try {
            // APIを使用して作品を削除
            const response = await axios.delete(`/api/works/${id}`);

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            // 削除成功時は一覧から削除
            setWorks(works.filter(work => work.id !== id));
        } catch (error) {
            console.error('作品削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + (error.response?.data?.message || error.message));
        }
    };

    // テーブルのカラム定義
    const columns = [
        {
            key: 'title',
            label: 'タイトル',
            render: (item) => (
                <Link
                    href={`/admin/works/${item.id}/edit`}
                    className="text-primary hover:underline"
                >
                    {item.title}
                </Link>
            )
        },
        {
            key: 'year',
            label: '年',
        },
        {
            key: 'categoryName',
            label: 'カテゴリ',
        },
        {
            key: 'mainRoles',
            label: 'メイン役割',
            render: (item) => item.mainRoles || '-'
        },
        {
            key: 'roleCount',
            label: '役割',
            render: (item) => (
                <Link
                    href={`/admin/works/${item.id}/roles/`}  // ここを修正 - 末尾にスラッシュを追加
                    className="px-2 py-1 bg-primary-light text-primary text-xs rounded-full hover:bg-primary hover:text-white"
                >
                    {item.roleCount} 役割
                </Link>
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
                <title>出演作品管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">出演作品管理</h1>
                    <p className="text-gray-600">アニメ、ゲーム、吹き替えなどの出演作品を管理します</p>
                </div>

                <DataTable
                    data={works}
                    columns={columns}
                    title="出演作品一覧"
                    addButtonLink="/admin/works/new"
                    addButtonText="新規作品追加"
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
}