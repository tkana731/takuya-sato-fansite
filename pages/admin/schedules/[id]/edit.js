import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function EditSchedule() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const { id } = router.query;
    const [submitting, setSubmitting] = useState(false);
    const [scheduleData, setScheduleData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [broadcastStations, setBroadcastStations] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formFields, setFormFields] = useState([]);
    const [performanceInfo, setPerformanceInfo] = useState('');

    // カテゴリIDから種類を判定
    const getCategoryType = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : '';
    };

    // カテゴリが放送系かどうか判定
    const isBroadcastCategory = (categoryName) => {
        return categoryName === '生放送';
    };

    // スケジュールデータの取得
    useEffect(() => {
        const fetchScheduleData = async () => {
            if (!id) return;

            try {
                setDataLoading(true);

                // マスターデータを先に取得
                // カテゴリを取得
                const { data: categoryData, error: categoryError } = await supabase
                    .from('mst_schedule_categories')
                    .select('id, name, displayOrder')
                    .order('displayOrder', { ascending: true });

                if (categoryError) throw categoryError;

                // 会場を取得
                const { data: venueData, error: venueError } = await supabase
                    .from('mst_venues')
                    .select('id, name, displayOrder')
                    .order('displayOrder', { ascending: true });

                if (venueError) throw venueError;

                // 放送局を取得
                const { data: stationData, error: stationError } = await supabase
                    .from('mst_broadcast_stations')
                    .select('id, name, displayOrder')
                    .order('displayOrder', { ascending: true });

                if (stationError) throw stationError;

                setCategories(categoryData || []);
                setVenues(venueData || []);
                setBroadcastStations(stationData || []);

                // スケジュールデータを取得
                const { data, error } = await supabase
                    .from('schedules')
                    .select(`
                        id, 
                        categoryId,
                        venueId,
                        broadcast_station_id,
                        workId,
                        title,
                        startDate,
                        endDate,
                        isAllDay,
                        description,
                        officialUrl,
                        category:categoryId (name)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                console.log('スケジュールデータ:', data);

                // パフォーマンスデータを取得
                const { data: performanceData, error: performanceError } = await supabase
                    .from('rel_schedule_performances')
                    .select('display_start_time')
                    .eq('schedule_id', id)
                    .order('display_order', { ascending: true });

                if (performanceError) throw performanceError;

                // パフォーマンス情報を文字列にフォーマット
                const performanceString = performanceData
                    ? performanceData.map(p => p.display_start_time).join(' / ')
                    : '';

                // カテゴリを設定
                const categoryName = data.category ? data.category.name : '';
                setSelectedCategory(data.categoryId);

                // ロケーションIDを設定（会場または放送局）
                const isBroadcast = isBroadcastCategory(categoryName);
                const locationId = isBroadcast ? data.broadcast_station_id : data.venueId;

                // スケジュールデータを設定
                setScheduleData({
                    ...data,
                    locationId: locationId || '',
                    startDate: data.startDate ? data.startDate.substring(0, 10) : '',
                    endDate: data.endDate ? data.endDate.substring(0, 10) : '',
                });

                setPerformanceInfo(performanceString);
            } catch (error) {
                console.error('スケジュールデータの取得エラー:', error);
                alert('スケジュールデータの取得に失敗しました');
            } finally {
                setDataLoading(false);
            }
        };

        fetchScheduleData();
    }, [id]);

    // フォーム送信
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // 日付データの変換
            const startDate = new Date(values.startDate);
            const endDate = values.endDate ? new Date(values.endDate) : null;

            // カテゴリ種別の判定
            const categoryName = getCategoryType(values.categoryId);
            const isBroadcast = isBroadcastCategory(categoryName);

            // スケジュールデータを更新
            const { data, error } = await supabase
                .from('schedules')
                .update({
                    title: values.title,
                    categoryId: values.categoryId,
                    // カテゴリに応じて会場IDまたは放送局ID
                    venueId: !isBroadcast ? values.locationId : null,
                    broadcast_station_id: isBroadcast ? values.locationId : null,
                    startDate: startDate.toISOString(),
                    endDate: endDate?.toISOString() || null,
                    isAllDay: values.isAllDay || false,
                    description: values.description,
                    officialUrl: values.officialUrl
                })
                .eq('id', id)
                .select();

            if (error) throw error;

            // パフォーマンス情報が変更されている場合、いったん削除して再登録
            if (values.performanceInfo !== performanceInfo) {
                // 既存のパフォーマンス情報を削除
                const { error: deleteError } = await supabase
                    .from('rel_schedule_performances')
                    .delete()
                    .eq('schedule_id', id);

                if (deleteError) throw deleteError;

                // 新しいパフォーマンス情報を登録
                if (values.performanceInfo) {
                    const timeStrings = values.performanceInfo.split('/').map(str => str.trim());

                    const performances = timeStrings.map((timeString, index) => ({
                        schedule_id: id,
                        performance_date: startDate.toISOString(),
                        display_start_time: timeString,
                        display_order: index + 1
                    }));

                    const { error: insertError } = await supabase
                        .from('rel_schedule_performances')
                        .insert(performances);

                    if (insertError) throw insertError;
                }
            }

            router.push('/admin/schedules');
        } catch (error) {
            console.error('スケジュール更新エラー:', error);
            alert('スケジュールの更新に失敗しました');
        } finally {
            setSubmitting(false);
        }
    };

    // カテゴリ選択時の処理
    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
    };

    // フォームフィールドの更新
    useEffect(() => {
        if (!selectedCategory) return;

        // カテゴリ名の取得
        const categoryName = getCategoryType(selectedCategory);
        const isBroadcast = isBroadcastCategory(categoryName);

        // ロケーションオプションの設定
        const locationOptions = isBroadcast
            ? broadcastStations.map(station => ({
                value: station.id,
                label: station.name,
            }))
            : venues.map(venue => ({
                value: venue.id,
                label: venue.name,
            }));

        // ロケーションフィールドのラベル設定
        const locationLabel = isBroadcast ? '放送局/配信サイト' : '会場';

        // フォームフィールド定義
        const fields = [
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
                onChange: handleCategoryChange,
            },
            {
                name: 'locationId',
                label: locationLabel,
                type: 'select',
                required: true,
                options: locationOptions,
                span: 'sm:col-span-3',
                placeholder: isBroadcast ? '放送局/配信サイトを選択' : '会場を選択',
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
                label: isBroadcast ? '放送時間' : '公演時間',
                type: 'textarea',
                span: 'sm:col-span-6',
                placeholder: isBroadcast
                    ? '例: 21:00～22:00 / 再放送 24:00～（複数回は「/」で区切ってください）'
                    : '例: 13:00～ / 17:00～（複数回公演の場合は「/」で区切ってください）',
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

        setFormFields(fields);
    }, [selectedCategory, categories, venues, broadcastStations]);

    // フォームの初期値設定
    useEffect(() => {
        if (scheduleData && performanceInfo !== undefined) {
            scheduleData.performanceInfo = performanceInfo;
        }
    }, [scheduleData, performanceInfo]);

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
                <title>スケジュール編集 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">スケジュール編集</h1>
                    <p className="text-gray-600">イベント、舞台、生放送などのスケジュールを編集します</p>
                </div>

                {/* スケジュールデータとフォームフィールドが準備できたら表示 */}
                {scheduleData && formFields.length > 0 && (
                    <FormBuilder
                        fields={formFields}
                        initialValues={scheduleData}
                        onSubmit={handleSubmit}
                        title="スケジュール情報"
                        submitButtonText="スケジュールを更新"
                        cancelHref="/admin/schedules"
                        isSubmitting={submitting}
                    />
                )}
            </div>
        </AdminLayout>
    );
}