// lib/error-handler.js
/**
 * エラーログ出力関数
 * @param {string} context - エラーが発生したコンテキスト
 * @param {Error|string} error - エラーオブジェクトまたはメッセージ
 * @param {object} additionalInfo - 追加情報
 */
export function logError(context, error, additionalInfo = {}) {
    const errorMessage = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack : new Error().stack;

    console.error(`[ERROR] ${context}:`, {
        message: errorMessage,
        ...additionalInfo,
        stack: stackTrace
    });
}

/**
 * APIリクエストエラー処理用関数
 * @param {object} res - レスポンスオブジェクト
 * @param {Error|string} error - エラーオブジェクトまたはメッセージ 
 * @param {number} statusCode - ステータスコード（デフォルト: 500）
 * @param {string} context - エラーコンテキスト
 * @param {object} additionalInfo - 追加情報
 */
export function handleApiError(res, error, statusCode = 500, context = 'API Error', additionalInfo = {}) {
    // エラーログ出力
    logError(context, error, additionalInfo);

    // Supabase特有のエラー形式をチェック
    const errorMessage = error.error?.message || error.message || 'エラーが発生しました';
    const errorDetails = error.details || error.error?.details || null;

    // エラーレスポンスを返す
    return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        details: errorDetails,
        ...(Object.keys(additionalInfo).length > 0 ? { additionalInfo } : {})
    });
}

/**
 * APIリクエスト成功時のレスポンス作成関数
 * @param {object} res - レスポンスオブジェクト
 * @param {object|array} data - 返却データ
 * @param {string} message - 成功メッセージ
 * @param {number} statusCode - ステータスコード（デフォルト: 200）
 */
export function sendSuccessResponse(res, data = null, message = '操作が成功しました', statusCode = 200) {
    const response = {
        success: true,
        message
    };

    // データがある場合のみ追加（nullや空配列の場合でも含める）
    if (data !== undefined) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
}

/**
 * APIリクエストでのバリデーションエラー処理
 * @param {object} res - レスポンスオブジェクト
 * @param {object|string} validationErrors - バリデーションエラー情報
 */
export function handleValidationError(res, validationErrors) {
    // エラーがオブジェクトでない場合は文字列として扱う
    const errors = typeof validationErrors === 'object'
        ? validationErrors
        : { message: validationErrors };

    return res.status(400).json({
        success: false,
        message: '入力内容に問題があります',
        errors
    });
}

/**
 * HTTPメソッドチェック関数
 * @param {object} req - リクエストオブジェクト
 * @param {object} res - レスポンスオブジェクト
 * @param {string|array} allowedMethods - 許可されたHTTPメソッド
 * @returns {boolean} - メソッドが許可されているかどうか
 */
export function checkHttpMethod(req, res, allowedMethods) {
    // 文字列の場合は配列に変換
    const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods];

    // メソッドが許可されているかチェック
    if (!methods.includes(req.method)) {
        res.status(405).json({
            success: false,
            message: 'Method not allowed',
            allowedMethods: methods
        });
        return false;
    }

    return true;
}