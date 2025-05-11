import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FormBuilder from '../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';

export default function NewSchedule() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // マスタデータの取得
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setDataLoading(true);

                // カテゴリを取得
                const { data: categoryData, error: categoryError } = await supabase
                    .from('mst_schedule_categories')
                    .select('id, name')
                    .order('display_order', { ascending: true });

                if (categoryError) throw categoryError;

                // 会場を取得
                const { data: venueData, error: venueError } = await supabase
                    .from('mst_venues')
                    .select('id, name')
                    .order('display_order', { ascending: true });

                if (venueError) throw venueError;

                setCategories(categoryData || []);
                setVenues(venueData || []);
            } catch (error) {
                console.error('マスタデータの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchMasterData();
    }, []);

    // フォーム送信
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // 日付データの変換
            const startDate = new Date(values.startDate);
            const endDate = values.endDate ? new Date(values.endDate) : null;

            // スケジュールデータを登録
            const { data, error } = await supabase
                .from('schedules')
                .insert([
                    {
                        title: values.title,
                        category_id: values.categoryId,
                        venue_id: values.venueId,
                        start_date: startDate.toISOString(),
                        end_date: endDate?.toISOString() || null,
                        is_all_day: values.isAllDay || false,
                        description: values.description,
                        official_url: values.officialUrl
                    }
                ])
                .select();

            if (error) throw error;

            // 公演情報を登録（もしあれば）
            if (values.performanceInfo && data && data[0]) {
                const scheduleId = data[0].id;
                const timeStrings = values.performanceInfo.split('/').map(str => str.trim());

                const performances = timeStrings.map((timeString, index) => ({
                    schedule_id: scheduleId,
                    performance_date: startDate.toISOString(),
                    display_start_time: timeString,
                    display_order: index + 1
                }));

                const { error: performanceError } = await supabase
                    .from('rel_schedule_performances')
                    .insert(performances);

                if (performanceError) throw performanceError;
            }

            router.push('/admin/schedules');
        } catch (error) {
            console.error('スケジュール登録エラー:', error);
            alert('スケジュールの登録に失敗しました');
        } finally {
            setSubmitting(false);
        }
    };

    // フォームフィールドの定義
    const formFields = [
        {
            name: 'title',
            label: 'タイトル',
            type: 'text',
            required: true,
            placeholder: 'スケジュールのタイトルを入力',
            span: 'sm:col-span-6',
        },
        {
            name: 'categoryId',
            label: 'カテゴリ',
            type: 'select',
            required: true,
            options: categories.map(category => ({
                value: category.id,
                label: category.name,
            })),
            span: 'sm:col-span-3',
        },
        {
            name: 'venueId',
            label: '会場',
            type: 'select',
            required: true,
            options: venues.map(venue => ({
                value: venue.id,
                label: venue.name,
            })),
            span: 'sm:col-span-3',
        },
        {
            name: 'startDate',
            label: '開始日',
            type: 'date',
            required: true,
            span: 'sm:col-span-2',
        },
        {
            name: 'endDate',
            label: '終了日',
            type: 'date',
            span: 'sm:col-span-2',
            help: '複数日開催の場合のみ入力',
        },
        {
            name: 'isAllDay',
            label: '終日',
            type: 'checkbox',
            checkboxLabel: '終日イベント',
            span: 'sm:col-span-2',
        },
        {
            name: 'performanceInfo',
            label: '公演情報',
            type: 'textarea',
            span: 'sm:col-span-6',
            placeholder: '例: 13:00～ / 17:00～（複数回公演の場合は「/」で区切ってください）',
            rows: 3,
        },
        {
            name: 'description',
            label: '説明',
            type: 'textarea',
            span: 'sm:col-span-6',
            placeholder: 'スケジュールの説明（出演者情報など）',
            rows: 4,
        },
        {
            name: 'officialUrl',
            label: '公式URL',
            type: 'text',
            placeholder: 'https://example.com',
            span: 'sm:col-span-6',
        },
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
                <title>新規スケジュール追加 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">新規スケジュール追加</h1>
                    <p className="text-gray-600">イベント、舞台、生放送などのスケジュールを追加します</p>
                </div>

                <FormBuilder
                    fields={formFields}
                    onSubmit={handleSubmit}
                    title="スケジュール情報"
                    submitButtonText="スケジュールを登録"
                    cancelHref="/admin/schedules"
                    isSubmitting={submitting}
                />
            </div>
        </AdminLayout>
    );
}