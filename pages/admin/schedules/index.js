import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';

export default function SchedulesAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [schedules, setSchedules] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // スケジュールデータの取得
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setDataLoading(true);

                // カテゴリ情報を事前取得してマッピング
                const { data: categories, error: categoryError } = await supabase
                    .from('mst_schedule_categories')
                    .select('id, name, color_code');

                if (categoryError) throw categoryError;

                // カテゴリIDをキーとした連想配列を作成
                const categoryMap = {};
                categories.forEach(cat => {
                    categoryMap[cat.id] = cat;
                });

                // スケジュールデータを取得（更新：venue_idまたはbroadcast_station_idの両方を考慮）
                const { data, error } = await supabase
                    .from('schedules')
                    .select(`
                        id, 
                        title, 
                        start_date,
                        is_all_day,
                        description, 
                        official_url,
                        category:category_id (id, name, color_code),
                        venue:venue_id (name),
                        broadcastStation:broadcast_station_id (name)
                    `)
                    .order('start_date', { ascending: true });

                if (error) throw error;

                console.log('取得したスケジュール:', data);

                // データを整形
                const formattedSchedules = data.map(schedule => {
                    const date = new Date(schedule.start_date);
                    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

                    // カテゴリ名に基づいて判定
                    const isBroadcast = schedule.category?.name === '生放送';

                    // カテゴリによってロケーション（会場or放送局）を選択
                    const location = isBroadcast
                        ? schedule.broadcastStation?.name
                        : schedule.venue?.name;

                    return {
                        id: schedule.id,
                        date: schedule.start_date,
                        weekday: weekdays[date.getDay()],
                        title: schedule.title,
                        category: schedule.category?.name === 'イベント' ? 'event' :
                            schedule.category?.name === '舞台・朗読' ? 'stage' :
                                schedule.category?.name === '生放送' ? 'broadcast' : 'other',
                        categoryName: schedule.category?.name || '',
                        location: location || '未設定',
                        locationType: isBroadcast ? '放送局/配信' : '会場',
                        description: schedule.description || '',
                        isAllDay: schedule.is_all_day,
                        officialUrl: schedule.officialUrl || '#'
                    };
                });

                setSchedules(formattedSchedules);
            } catch (error) {
                console.error('スケジュールの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    // スケジュール削除
    const handleDelete = async (id) => {
        try {
            // トランザクションで関連するデータを削除
            // まず、関連するパフォーマンス情報を削除
            const { error: performanceError } = await supabase
                .from('rel_schedule_performances')
                .delete()
                .eq('schedule_id', id);

            if (performanceError) throw performanceError;

            // 次に、関連する出演者情報を削除（もし存在すれば）
            const { error: performerError } = await supabase
                .from('rel_schedule_performers')
                .delete()
                .eq('schedule_id', id);

            if (performerError) throw performerError;

            // 最後にスケジュール自体を削除
            const { error } = await supabase
                .from('schedules')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // 削除成功時は一覧から削除
            setSchedules(schedules.filter(schedule => schedule.id !== id));
        } catch (error) {
            console.error('スケジュール削除エラー:', error);
            alert('削除処理中にエラーが発生しました');
        }
    };

    // テーブルのカラム定義
    const columns = [
        {
            key: 'date',
            label: '日付',
            render: (item) => {
                const date = new Date(item.date);
                return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} (${item.weekday})`;
            }
        },
        {
            key: 'title',
            label: 'タイトル',
        },
        {
            key: 'categoryName',
            label: 'カテゴリ',
            render: (item) => {
                const categoryClassMap = {
                    'event': 'bg-orange-100 text-orange-800',
                    'stage': 'bg-purple-100 text-purple-800',
                    'broadcast': 'bg-green-100 text-green-800',
                };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${categoryClassMap[item.category] || 'bg-gray-100 text-gray-800'}`}>
                        {item.categoryName}
                    </span>
                );
            }
        },
        {
            key: 'location',
            label: 'ロケーション',
            render: (item) => {
                return (
                    <div>
                        <span className="text-xs text-gray-600 block">{item.locationType}</span>
                        {item.location}
                    </div>
                );
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
                <title>スケジュール管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">スケジュール管理</h1>
                    <p className="text-gray-600">イベント、舞台、生放送などのスケジュールを管理します</p>
                </div>

                <div className="overflow-x-auto">
                    <DataTable
                        data={schedules}
                        columns={columns}
                        title="スケジュール一覧"
                        addButtonLink="/admin/schedules/new"
                        addButtonText="新規スケジュール追加"
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}