import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/Admin/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';

export default function OnAirAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [broadcasts, setBroadcasts] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 放送情報のデータ取得
    useEffect(() => {
        const fetchBroadcasts = async () => {
            try {
                setDataLoading(true);

                // 作品とそれに紐づく放送情報を取得
                const { data, error } = await supabase
                    .from('rel_broadcast_channels')
                    .select(`
                        id,
                        broadcast_start_date,
                        broadcast_end_date,
                        display_broadcast_time,
                        work:work_id (
                            id,
                            title,
                            category:category_id (id, name)
                        ),
                        station:station_id (
                            id,
                            name,
                            type:type_id (id, name)
                        ),
                        weekday:weekday_id (
                            id,
                            name
                        )
                    `)
                    .order('broadcast_end_date', { ascending: false });

                if (error) throw error;

                console.log('取得した放送情報:', data);

                // 放送情報を整形
                const formattedBroadcasts = data.map(broadcast => {
                    // 日付をフォーマット
                    const startDate = broadcast.broadcast_start_date
                        ? new Date(broadcast.broadcast_start_date).toLocaleDateString('ja-JP')
                        : '未定';
                    const endDate = broadcast.broadcast_end_date
                        ? new Date(broadcast.broadcast_end_date).toLocaleDateString('ja-JP')
                        : '未定';

                    // カテゴリ情報を取得
                    const categoryName = broadcast.work?.category?.name || '不明';
                    const stationType = broadcast.station?.type?.name || '不明';

                    return {
                        id: broadcast.id,
                        workId: broadcast.work?.id,
                        title: broadcast.work?.title || '不明な作品',
                        category: categoryName,
                        station: broadcast.station?.name || '不明',
                        stationType: stationType,
                        weekday: broadcast.weekday?.name || '不明',
                        time: broadcast.display_broadcast_time || '時間未定',
                        broadcastPeriod: `${startDate} 〜 ${endDate}`
                    };
                });

                setBroadcasts(formattedBroadcasts);
            } catch (error) {
                console.error('放送情報の取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchBroadcasts();
    }, []);

    // 放送情報の削除
    const handleDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('rel_broadcast_channels')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setBroadcasts(broadcasts.filter(broadcast => broadcast.id !== id));
        } catch (error) {
            console.error('放送情報削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + error.message);
        }
    };

    // テーブルのカラム定義
    const columns = [
        {
            key: 'title',
            label: '作品タイトル',
            render: (item) => (
                <Link
                    href={`/admin/works/${item.workId}/edit`}
                    className="text-primary hover:underline"
                >
                    {item.title}
                </Link>
            )
        },
        {
            key: 'category',
            label: 'カテゴリ',
            render: (item) => {
                const categoryClassMap = {
                    'アニメ': 'bg-blue-100 text-blue-800',
                    'ラジオ': 'bg-green-100 text-green-800',
                    'WEB': 'bg-purple-100 text-purple-800'
                };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${categoryClassMap[item.category] || 'bg-gray-100 text-gray-800'}`}>
                        {item.category}
                    </span>
                );
            }
        },
        {
            key: 'station',
            label: '放送局/配信サイト',
            render: (item) => (
                <div>
                    <span className="text-sm font-medium">{item.station}</span>
                    <br />
                    <span className="text-xs text-gray-500">{item.stationType}</span>
                </div>
            )
        },
        {
            key: 'weekday',
            label: '曜日',
        },
        {
            key: 'time',
            label: '時間',
        },
        {
            key: 'broadcastPeriod',
            label: '放送期間',
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
                <title>放送情報管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">放送情報管理</h1>
                    <p className="text-gray-600">テレビ、ラジオ、WEB配信などの放送情報を管理します</p>
                </div>

                <DataTable
                    data={broadcasts}
                    columns={columns}
                    title="放送情報一覧"
                    addButtonLink="/admin/on-air/new"
                    addButtonText="新規放送情報追加"
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
}