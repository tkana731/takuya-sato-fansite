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
                const { data, error } = await supabase
                    .from('schedules')
                    .select(`
            id, 
            title, 
            start_date,
            is_all_day,
            description, 
            official_url,
            venue:venue_id (name),
            category:category_id (name, color_code)
          `)
                    .order('start_date', { ascending: true });

                if (error) throw error;

                // データを整形
                const formattedSchedules = data.map(schedule => {
                    const date = new Date(schedule.start_date);
                    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                    return {
                        id: schedule.id,
                        date: schedule.start_date,
                        weekday: weekdays[date.getDay()],
                        title: schedule.title,
                        category: schedule.category?.name === 'イベント' ? 'event' :
                            schedule.category?.name === '舞台・朗読' ? 'stage' :
                                schedule.category?.name === '生放送' ? 'broadcast' : 'other',
                        categoryName: schedule.category?.name || '',
                        location: schedule.venue?.name || '',
                        description: schedule.description || '',
                        isAllDay: schedule.is_all_day,
                        officialUrl: schedule.official_url || '#'
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
                return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${item.weekday})`;
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
            label: '場所',
        },
        {
            key: 'isAllDay',
            label: '終日',
            render: (item) => item.isAllDay ? '終日' : '-'
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

                <DataTable
                    data={schedules}
                    columns={columns}
                    title="スケジュール一覧"
                    addButtonLink="/admin/schedules/new"
                    addButtonText="新規スケジュール追加"
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
}