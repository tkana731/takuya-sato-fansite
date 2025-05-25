// lib/api-helpers.js
import { supabase } from './supabase';

/**
 * Supabaseからデータを取得する汎用関数
 * @param {string} table - テーブル名
 * @param {Object} options - クエリオプション
 * @param {string} options.select - SELECT句
 * @param {Object} options.filters - WHERE条件
 * @param {string} options.order - ORDER BY句
 * @param {number} options.limit - LIMIT句
 * @param {boolean} options.single - 単一レコードを取得するか
 * @returns {Promise<Object>} 取得結果
 */
export async function fetchData(table, options = {}) {
  try {
    let query = supabase.from(table);

    // SELECT句の設定
    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    // WHERE条件の設定
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // 比較演算子が含まれている場合
          Object.entries(value).forEach(([operator, operatorValue]) => {
            switch (operator) {
              case 'eq':
                query = query.eq(key, operatorValue);
                break;
              case 'neq':
                query = query.neq(key, operatorValue);
                break;
              case 'gt':
                query = query.gt(key, operatorValue);
                break;
              case 'gte':
                query = query.gte(key, operatorValue);
                break;
              case 'lt':
                query = query.lt(key, operatorValue);
                break;
              case 'lte':
                query = query.lte(key, operatorValue);
                break;
              case 'like':
                query = query.like(key, operatorValue);
                break;
              case 'ilike':
                query = query.ilike(key, operatorValue);
                break;
              case 'in':
                query = query.in(key, operatorValue);
                break;
              case 'is':
                query = query.is(key, operatorValue);
                break;
              default:
                query = query.eq(key, operatorValue);
            }
          });
        } else {
          // 単純な等価比較
          query = query.eq(key, value);
        }
      });
    }

    // ORDER BY句の設定
    if (options.order) {
      if (typeof options.order === 'string') {
        query = query.order(options.order);
      } else if (typeof options.order === 'object') {
        Object.entries(options.order).forEach(([column, direction]) => {
          query = query.order(column, { ascending: direction === 'asc' });
        });
      }
    }

    // LIMIT句の設定
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // 単一レコード取得の設定
    if (options.single) {
      query = query.single();
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Supabaseにデータを挿入する汎用関数
 * @param {string} table - テーブル名
 * @param {Object|Array} data - 挿入するデータ
 * @param {Object} options - オプション
 * @returns {Promise<Object>} 挿入結果
 */
export async function insertData(table, data, options = {}) {
  try {
    let query = supabase.from(table).insert(data);

    if (options.select) {
      query = query.select(options.select);
    }

    const { data: insertedData, error } = await query;

    if (error) {
      throw error;
    }

    return { data: insertedData, error: null };
  } catch (error) {
    console.error(`Error inserting data into ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Supabaseのデータを更新する汎用関数
 * @param {string} table - テーブル名
 * @param {Object} data - 更新するデータ
 * @param {Object} filters - WHERE条件
 * @param {Object} options - オプション
 * @returns {Promise<Object>} 更新結果
 */
export async function updateData(table, data, filters, options = {}) {
  try {
    let query = supabase.from(table).update(data);

    // WHERE条件の設定
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.select) {
      query = query.select(options.select);
    }

    const { data: updatedData, error } = await query;

    if (error) {
      throw error;
    }

    return { data: updatedData, error: null };
  } catch (error) {
    console.error(`Error updating data in ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * Supabaseからデータを削除する汎用関数
 * @param {string} table - テーブル名
 * @param {Object} filters - WHERE条件
 * @returns {Promise<Object>} 削除結果
 */
export async function deleteData(table, filters) {
  try {
    let query = supabase.from(table).delete();

    // WHERE条件の設定
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error deleting data from ${table}:`, error);
    return { data: null, error };
  }
}

/**
 * APIレスポンスをフォーマットする関数
 * @param {boolean} success - 成功フラグ
 * @param {any} data - レスポンスデータ
 * @param {string} message - メッセージ
 * @param {number} status - HTTPステータスコード
 * @returns {Object} フォーマットされたレスポンス
 */
export function formatApiResponse(success, data = null, message = '', status = 200) {
  return {
    success,
    data,
    message,
    status,
    timestamp: new Date().toISOString()
  };
}

/**
 * エラーレスポンスを作成する関数
 * @param {string} message - エラーメッセージ
 * @param {number} status - HTTPステータスコード
 * @param {any} details - エラー詳細
 * @returns {Object} エラーレスポンス
 */
export function createErrorResponse(message, status = 500, details = null) {
  return formatApiResponse(false, null, message, status, details);
}

/**
 * 成功レスポンスを作成する関数
 * @param {any} data - レスポンスデータ
 * @param {string} message - メッセージ
 * @param {number} status - HTTPステータスコード
 * @returns {Object} 成功レスポンス
 */
export function createSuccessResponse(data, message = '', status = 200) {
  return formatApiResponse(true, data, message, status);
}