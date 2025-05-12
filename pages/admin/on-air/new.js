import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FormBuilder from '../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';

export default function NewBroadcast() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [works, setWorks] = useState([]);
    const [stations, setStations] = useState([]);
    const [weekdays, setWeekdays] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 作品、放送局、曜日のデータを取得
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setDataLoading(true);

                // 作品データを取得（アニメ、ラジオ、WEBカテゴリのみ）
                const { data: categoryData, error: categoryError } = await supabase
                    .from('mst_work_categories')
                    .select('id, name')
                    .in('name', ['アニメ', 'ラジオ', 'WEB']);

                if (categoryError) throw categoryError;

                const categoryIds = categoryData.map(cat => cat.id);

                // カテゴリIDに合致する作品を取得
                const { data: worksData, error: worksError } = await supabase
                    .from('works')
                    .select('id, title, category_id, category:category_id(name)')
                    .in('category_id', categoryIds)
                    .order('title');

                if (worksError) throw worksError;

                // 放送局データを取得
                const { data: stationsData, error: stationsError } = await supabase
                    .from('mst_broadcast_stations')
                    .select('id, name, type_id, type:type_id(name)')
                    .order('name');

                if (stationsError) throw stationsError;

                // 曜日データを取得
                const { data: weekdaysData, error: weekdaysError } = await supabase
                    .from('mst_weekdays')
                    .select('id, name, display_order')
                    .order('display_order');

                if (weekdaysError) throw weekdaysError;

                setWorks(worksData || []);
                setStations(stationsData || []);
                setWeekdays(weekdaysData || []);
            } catch (error) {
                console.error('マスターデータ取得エラー:', error);
                alert('データの取得に失敗しました: ' + error.message);
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
            // 放送開始・終了日のフォーマット
            const startDate = values.broadcastStartDate
                ? new Date(values.broadcastStartDate).toISOString()
                : null;
            const endDate = values.broadcastEndDate
                ? new Date(values.broadcastEndDate).toISOString()
                : null;

            // 放送情報を登録
            const { data: newBroadcast, error } = await supabase
                .from('rel_broadcast_channels')
                .insert([{
                    work_id: values.workId,
                    station_id: values.stationId,
                    weekday_id: values.weekdayId,
                    broadcast_start_date: startDate,
                    broadcast_end_date: endDate,
                    display_broadcast_time: values.displayBroadcastTime || null
                }])
                .select();

            if (error) throw error;

            // 成功時は一覧ページへリダイレクト
            router.push('/admin/on-air');
        } catch (error) {
            console.error('放送情報登録エラー:', error);
            alert('放送情報の登録に失敗しました: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // カテゴリでフィルタリングされた作品選択肢を生成
    const generateWorkOptions = () => {
        // カテゴリごとにグループ化
        const categorizedWorks = works.reduce((acc, work) => {
            const categoryName = work.category?.name || '未分類';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(work);
            return acc;
        }, {});

        // オプションリストを生成
        let options = [];

        // カテゴリごとにオプショングループを作成
        Object.keys(categorizedWorks).forEach(category => {
            // カテゴリ見出し（選択不可）
            options.push({
                value: `header-${category}`,
                label: `--- ${category} ---`,
                disabled: true
            });

            // 作品オプション
            categorizedWorks[category].forEach(work => {
                options.push({
                    value: work.id,
                    label: work.title
                });
            });
        });

        return options;
    };

    // 放送局タイプでグループ化されたオプションを生成
    const generateStationOptions = () => {
        // タイプごとにグループ化
        const categorizedStations = stations.reduce((acc, station) => {
            const typeName = station.type?.name || '未分類';
            if (!acc[typeName]) {
                acc[typeName] = [];
            }
            acc[typeName].push(station);
            return acc;
        }, {});

        // オプションリストを生成
        let options = [];

        // タイプごとにオプショングループを作成
        Object.keys(categorizedStations).forEach(type => {
            // タイプ見出し（選択不可）
            options.push({
                value: `header-${type}`,
                label: `--- ${type} ---`,
                disabled: true
            });

            // 放送局オプション
            categorizedStations[type].forEach(station => {
                options.push({
                    value: station.id,
                    label: station.name
                });
            });
        });

        return options;
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'workId',
            label: '作品',
            type: 'select',
            required: true,
            options: generateWorkOptions(),
            span: 'sm:col-span-6',
            placeholder: '放送する作品を選択',
        },
        {
            name: 'stationId',
            label: '放送局/配信サイト',
            type: 'select',
            required: true,
            options: generateStationOptions(),
            span: 'sm:col-span-6',
            placeholder: '放送局または配信サイトを選択',
        },
        {
            name: 'weekdayId',
            label: '曜日',
            type: 'select',
            required: true,
            options: weekdays.map(weekday => ({
                value: weekday.id,
                label: weekday.name
            })),
            span: 'sm:col-span-3',
            placeholder: '放送曜日を選択',
        },
        {
            name: 'displayBroadcastTime',
            label: '放送時間',
            type: 'text',
            required: true,
            placeholder: '例: 毎週金曜 22:00～22:30',
            span: 'sm:col-span-3',
            help: '表示用の放送時間を入力してください'
        },
        {
            name: 'broadcastStartDate',
            label: '放送開始日',
            type: 'date',
            required: true,
            span: 'sm:col-span-3',
        },
        {
            name: 'broadcastEndDate',
            label: '放送終了日',
            type: 'date',
            required: true,
            span: 'sm:col-span-3',
            help: '放送終了予定日または配信終了日'
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
                <title>新規放送情報追加 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">新規放送情報追加</h1>
                    <p className="text-gray-600">テレビ、ラジオ、WEB配信などの放送情報を追加します</p>
                </div>

                <FormBuilder
                    fields={formFields}
                    onSubmit={handleSubmit}
                    title="放送情報"
                    submitButtonText="放送情報を登録"
                    cancelHref="/admin/on-air"
                    isSubmitting={submitting}
                />
            </div>
        </AdminLayout>
    );
}