// hooks/useDataFetching.js
import { useState, useEffect } from 'react';
import { fetchData, deleteData } from '../lib/api-helpers';

/**
 * データ取得と管理のためのカスタムフック
 * @param {string} table - テーブル名
 * @param {object} options - 取得オプション
 * @param {object} formatFunction - データ整形関数
 * @returns {object} データ、ローディング状態、エラー、削除関数
 */
export function useDataFetching(table, options = {}, formatFunction = null) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // データの再取得をトリガーする関数
    const refreshData = () => setRefreshTrigger(prev => prev + 1);

    // データ取得
    useEffect(() => {
        const fetchDataFromApi = async () => {
            setLoading(true);
            try {
                const result = await fetchData(table, options);

                // データ整形関数が提供されている場合は適用
                const formattedData = formatFunction
                    ? formatFunction(result.data)
                    : result.data;

                setData(formattedData || []);
                setError(null);
            } catch (err) {
                console.error(`${table}データの取得エラー:`, err);
                setError(`データの取得に失敗しました: ${err.message}`);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDataFromApi();
    }, [table, refreshTrigger]);

    // 削除処理
    const handleDelete = async (id) => {
        if (!window.confirm('本当に削除しますか？この操作は元に戻せません。')) {
            return false;
        }

        try {
            const result = await deleteData(table, id);

            if (result.success) {
                // 削除成功したらデータから削除
                setData(prevData => prevData.filter(item => item.id !== id));
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error(`${table}の削除エラー:`, err);
            alert(`削除に失敗しました: ${err.message}`);
            return false;
        }
    };

    return {
        data,
        loading,
        error,
        refreshData,
        handleDelete
    };
}

/**
 * 単一データ取得と管理のためのカスタムフック
 * @param {string} table - テーブル名
 * @param {string} id - 取得対象ID
 * @param {object} options - 取得オプション
 * @param {Function} formatFunction - データ整形関数
 * @returns {object} データ、ローディング状態、エラー
 */
export function useSingleDataFetching(table, id, options = {}, formatFunction = null) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // IDがない場合は何もしない
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchSingleData = async () => {
            setLoading(true);
            try {
                const mergedOptions = {
                    ...options,
                    filters: { ...options.filters, id },
                    single: true
                };

                const { data: result } = await fetchData(table, mergedOptions);

                // データ整形関数が提供されている場合は適用
                const formattedData = formatFunction ? formatFunction(result) : result;

                setData(formattedData);
                setError(null);
            } catch (err) {
                console.error(`${table}のデータ取得エラー:`, err);
                setError(`データの取得に失敗しました: ${err.message}`);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSingleData();
    }, [table, id]);

    return {
        data,
        loading,
        error
    };
}

/**
 * 複数のマスタデータを取得するカスタムフック
 * @param {object} tables - テーブル名と取得オプションのマップ
 * @returns {object} データマップ、ローディング状態、エラー、リフレッシュ関数
 */
export function useMasterDataFetching(tables) {
    const [masterData, setMasterData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // データの再取得をトリガーする関数
    const refreshData = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        const fetchAllMasterData = async () => {
            setLoading(true);
            try {
                const results = {};
                const tableEntries = Object.entries(tables);

                for (const [tableName, options] of tableEntries) {
                    const { data, error } = await fetchData(tableName, options);

                    if (error) throw new Error(`${tableName}の取得に失敗: ${error.message}`);

                    results[tableName] = data;
                }

                setMasterData(results);
                setError(null);
            } catch (err) {
                console.error('マスターデータの取得エラー:', err);
                setError(`マスターデータの取得に失敗しました: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchAllMasterData();
    }, [refreshTrigger]);

    return {
        masterData,
        loading,
        error,
        refreshData
    };
}