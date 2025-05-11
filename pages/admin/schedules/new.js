import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FormBuilder from '../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';
import LocationModal from '../../../components/Admin/LocationModal';
import axios from 'axios';

export default function NewSchedule() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [broadcastStations, setBroadcastStations] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formFields, setFormFields] = useState([]);

    // モーダル関連の状態
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationType, setLocationType] = useState(''); // 'venue' or 'broadcast'
    const [reloadMasterData, setReloadMasterData] = useState(0); // マスタデータを再取得するためのトリガー

    // カテゴリIDから種類を判定
    const getCategoryType = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : '';
    };

    // カテゴリが放送系かどうか判定
    const isBroadcastCategory = (categoryName) => {
        return categoryName === '生放送';
    };

    // マスタデータの取得
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setDataLoading(true);

                // カテゴリを取得
                const { data: categoryData, error: categoryError } = await supabase
                    .from('mst_schedule_categories')
                    .select('id, name, display_order')
                    .order('display_order', { ascending: true });

                if (categoryError) {
                    console.error('カテゴリ取得エラー詳細:', categoryError);
                    throw categoryError;
                }

                // 会場を取得
                const { data: venueData, error: venueError } = await supabase
                    .from('mst_venues')
                    .select('id, name, display_order')
                    .order('display_order', { ascending: true });

                if (venueError) {
                    console.error('会場取得エラー詳細:', venueError);
                    throw venueError;
                }

                // 放送局を取得
                const { data: stationData, error: stationError } = await supabase
                    .from('mst_broadcast_stations')
                    .select('id, name, display_order')
                    .order('display_order', { ascending: true });

                if (stationError) {
                    console.error('放送局取得エラー詳細:', stationError);
                    throw stationError;
                }

                setCategories(categoryData || []);
                setVenues(venueData || []);
                setBroadcastStations(stationData || []);
            } catch (error) {
                console.error('マスタデータの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchMasterData();
    }, [reloadMasterData]); // reloadMasterDataが変わるたびに再取得

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

            // スケジュールデータを作成（APIを使用）
            const response = await axios.post('/api/schedules/create', {
                title: values.title,
                categoryId: values.categoryId,
                locationId: values.locationId,
                isLocationBroadcast: isBroadcast,
                startDate: startDate,
                endDate: endDate,
                isAllDay: values.isAllDay || false,
                description: values.description,
                officialUrl: values.officialUrl,
                performanceInfo: values.performanceInfo
            });

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            router.push('/admin/schedules');
        } catch (error) {
            console.error('スケジュール登録エラー:', error);
            alert('スケジュールの登録に失敗しました: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    // カテゴリ選択時の処理
    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
    };

    // ロケーション選択時の処理
    const handleLocationChange = (e) => {
        const value = e.target.value;
        if (value === 'new') {
            // カテゴリから種類を判定
            const categoryName = getCategoryType(selectedCategory);
            const isBroadcast = isBroadcastCategory(categoryName);

            // モーダルを表示
            setLocationType(isBroadcast ? 'broadcast' : 'venue');
            setShowLocationModal(true);
        }
    };

    // 新規ロケーション追加後の処理
    const handleLocationAdded = (newLocation) => {
        // モーダルを閉じる
        setShowLocationModal(false);

        // マスタデータを再取得するためにトリガーを更新
        setReloadMasterData(prev => prev + 1);
    };

    // フォームフィールドの更新
    useEffect(() => {
        // カテゴリ名の取得
        const categoryName = getCategoryType(selectedCategory);
        const isBroadcast = isBroadcastCategory(categoryName);

        // ロケーションオプションの設定
        let locationOptions = [];

        if (isBroadcast) {
            // 放送局のオプション + 新規追加オプション
            locationOptions = broadcastStations.map(station => ({
                value: station.id,
                label: station.name,
            }));
        } else {
            // 会場のオプション + 新規追加オプション
            locationOptions = venues.map(venue => ({
                value: venue.id,
                label: venue.name,
            }));
        }

        // 新規追加オプションを追加
        locationOptions.push({
            value: 'new',
            label: '+ 新規追加',
        });

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
                onChange: handleLocationChange,
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

                {/* フォームフィールドが準備できたら表示 */}
                {formFields.length > 0 && (
                    <FormBuilder
                        fields={formFields}
                        onSubmit={handleSubmit}
                        title="スケジュール情報"
                        submitButtonText="スケジュールを登録"
                        cancelHref="/admin/schedules"
                        isSubmitting={submitting}
                    />
                )}

                {/* 新規ロケーション追加用モーダル */}
                {showLocationModal && (
                    <LocationModal
                        type={locationType}
                        onClose={() => setShowLocationModal(false)}
                        onLocationAdded={handleLocationAdded}
                    />
                )}
            </div>
        </AdminLayout>
    );
}