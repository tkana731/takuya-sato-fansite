// lib/api-helpers.js
import { supabase } from './supabase';

/**
 * 汎用データ取得関数
 * @param {string} table - テーブル名
 * @param {object} options - 取得オプション
 * @returns {Promise} 取得結果
 */
export async function fetchData(table, options = {}) {
    const {
        select = '*',
        filters = {},
        order = null,
        orderDirection = 'asc',
        limit = null,
        single = false,
        count = false,
        head = false
    } = options;

    try {
        let query = supabase.from(table).select(select, { count: count && 'exact', head });

        // フィルター適用
        Object.entries(filters).forEach(([column, condition]) => {
            if (typeof condition === 'object') {
                const [operator, value] = Object.entries(condition)[0];
                switch (operator) {
                    case 'eq': query = query.eq(column, value); break;
                    case 'neq': query = query.neq(column, value); break;
                    case 'gt': query = query.gt(column, value); break;
                    case 'lt': query = query.lt(column, value); break;
                    case 'gte': query = query.gte(column, value); break;
                    case 'lte': query = query.lte(column, value); break;
                    case 'like': query = query.like(column, value); break;
                    case 'ilike': query = query.ilike(column, value); break;
                    case 'in': query = query.in(column, value); break;
                    case 'is': query = query.is(column, value); break;
                }
            } else {
                query = query.eq(column, condition);
            }
        });

        // 並び順
        if (order) {
            query = query.order(order, { ascending: orderDirection === 'asc' });
        }

        // 制限
        if (limit) {
            query = query.limit(limit);
        }

        // 単一行取得
        if (single) {
            const { data, error, count: countResult } = await query.single();
            if (error) throw error;
            return { data, count: countResult };
        } else {
            const { data, error, count: countResult } = await query;
            if (error) throw error;
            return { data, count: countResult };
        }
    } catch (error) {
        console.error(`${table}データの取得エラー:`, error);
        throw error;
    }
}

/**
 * データ作成関数
 * @param {string} table - テーブル名
 * @param {object} data - 作成データ
 * @param {boolean} returnData - 作成されたデータを返すかどうか
 * @returns {Promise} 作成結果
 */
export async function createData(table, data, returnData = true) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert([data])
            .select(returnData ? '*' : '');

        if (error) throw error;
        return { success: true, data: returnData ? result[0] : null };
    } catch (error) {
        console.error(`${table}データの作成エラー:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * データ更新関数
 * @param {string} table - テーブル名
 * @param {string} id - 更新対象ID
 * @param {object} data - 更新データ
 * @param {boolean} returnData - 更新されたデータを返すかどうか
 * @returns {Promise} 更新結果
 */
export async function updateData(table, id, data, returnData = true) {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq('id', id)
            .select(returnData ? '*' : '');

        if (error) throw error;
        return {
            success: true,
            data: returnData && result.length > 0 ? result[0] : null
        };
    } catch (error) {
        console.error(`${table}データの更新エラー:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * データ削除関数
 * @param {string} table - テーブル名
 * @param {string} id - 削除対象ID
 * @returns {Promise} 削除結果
 */
export async function deleteData(table, id) {
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error(`${table}データの削除エラー:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * 関連データがあるかチェックする関数
 * @param {string} table - チェック対象テーブル名
 * @param {string} foreignKey - 外部キーフィールド名
 * @param {string} id - チェック対象ID
 * @returns {Promise<{hasRelated: boolean, count: number}>} 関連データの有無と件数
 */
export async function checkRelatedData(table, foreignKey, id) {
    try {
        const { data, count, error } = await supabase
            .from(table)
            .select('id', { count: 'exact', head: true })
            .eq(foreignKey, id);

        if (error) throw error;

        return {
            hasRelated: count > 0,
            count: count || 0
        };
    } catch (error) {
        console.error(`関連データのチェックエラー:`, error);
        throw error;
    }
}

/**
 * トランザクションを模倣した一連の操作を実行
 * (Supabaseはクライアントサイドでの真のトランザクションをサポートしていないため)
 * @param {Array<Function>} operations - 実行する操作の配列（非同期関数）
 * @returns {Promise<{success: boolean, results: Array, error: string|null}>}
 */
export async function runOperations(operations) {
    const results = [];
    try {
        for (const operation of operations) {
            const result = await operation();
            results.push(result);

            // 操作が失敗した場合、そこで中断
            if (result.error) {
                return {
                    success: false,
                    results,
                    error: `操作に失敗しました: ${result.error}`
                };
            }
        }
        return { success: true, results, error: null };
    } catch (error) {
        console.error('一連の操作の実行エラー:', error);
        return {
            success: false,
            results,
            error: error.message
        };
    }
}