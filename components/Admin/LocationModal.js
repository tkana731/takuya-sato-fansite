import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import axios from 'axios';

export default function LocationModal({ type, onClose, onLocationAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        postalCode: '',
        prefectureId: type === 'venue' ? '13' : '', // デフォルトは東京都
        address: '',
        capacity: '',
        officialUrl: '',
        googleMapsUrl: '',
        typeId: type === 'broadcast' ? '3' : '', // デフォルトは配信タイプ
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [prefectures, setPrefectures] = useState([]);
    const [stationTypes, setStationTypes] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // マスタデータ取得
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setDataLoading(true);

                if (type === 'venue') {
                    // 都道府県データ取得
                    const { data: prefectureData, error: prefectureError } = await supabase
                        .from('mst_prefectures')
                        .select('id, name, display_order')
                        .order('display_order', { ascending: true });

                    if (prefectureError) throw prefectureError;
                    setPrefectures(prefectureData || []);
                } else if (type === 'broadcast') {
                    // 放送局タイプ取得
                    const { data: typeData, error: typeError } = await supabase
                        .from('mst_station_types')
                        .select('id, name, display_order')
                        .order('display_order', { ascending: true });

                    if (typeError) throw typeError;
                    setStationTypes(typeData || []);
                }
            } catch (error) {
                console.error('マスタデータ取得エラー:', error);
                setError('マスタデータの取得に失敗しました');
            } finally {
                setDataLoading(false);
            }
        };

        fetchMasterData();
    }, [type]);

    // 入力値の変更処理
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // フォーム送信処理
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let newLocation;

            if (type === 'venue') {
                // APIエンドポイントを使って会場を追加
                const response = await axios.post('/api/venues/create', {
                    name: formData.name,
                    postalCode: formData.postalCode || null,
                    prefectureId: formData.prefectureId,
                    address: formData.address || null,
                    capacity: formData.capacity || null,
                    officialUrl: formData.officialUrl || null,
                    googleMapsUrl: formData.googleMapsUrl || null
                });

                if (!response.data.success) {
                    throw new Error(response.data.message);
                }

                newLocation = response.data.data;
            } else if (type === 'broadcast') {
                // APIエンドポイントを使って放送局を追加
                const response = await axios.post('/api/broadcast-stations/create', {
                    name: formData.name,
                    typeId: formData.typeId,
                    officialUrl: formData.officialUrl || null
                });

                if (!response.data.success) {
                    throw new Error(response.data.message);
                }

                newLocation = response.data.data;
            }

            // 成功したら親コンポーネントに通知
            onLocationAdded(newLocation);
        } catch (error) {
            console.error('登録エラー:', error);
            setError('登録に失敗しました：' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary">
                        新規{type === 'venue' ? '会場' : '放送局/配信サイト'}追加
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {dataLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="loading-spinner"></div>
                        <p className="ml-2">読み込み中...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                名称<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                placeholder={type === 'venue' ? '会場名を入力' : 'チャンネル/サイト名を入力'}
                            />
                        </div>

                        {type === 'venue' ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        都道府県<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="prefectureId"
                                        value={formData.prefectureId}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                    >
                                        <option value="">選択してください</option>
                                        {prefectures.map(pref => (
                                            <option key={pref.id} value={pref.id}>
                                                {pref.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        郵便番号
                                    </label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        placeholder="123-4567"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        住所
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        placeholder="東京都渋谷区1-2-3"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        収容人数
                                    </label>
                                    <input
                                        type="text"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        placeholder="約1000名"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    タイプ<span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="typeId"
                                    value={formData.typeId}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                >
                                    <option value="">選択してください</option>
                                    {stationTypes.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                公式URL
                            </label>
                            <input
                                type="url"
                                name="officialUrl"
                                value={formData.officialUrl}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                placeholder="https://example.com"
                            />
                        </div>

                        {type === 'venue' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Google MapsのURL
                                </label>
                                <input
                                    type="url"
                                    name="googleMapsUrl"
                                    value={formData.googleMapsUrl}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                    placeholder="https://goo.gl/maps/example"
                                />
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                disabled={loading}
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                                disabled={loading}
                            >
                                {loading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}