// lib/form-helpers.js
/**
 * 誕生日形式（MM/DD）のバリデーション
 * @param {string} value - 検証する値
 * @returns {string|null} エラーメッセージまたはnull
 */
export function validateBirthday(value) {
    if (!value) return null; // 空の場合はOK（必須でない場合）

    // MM/DD形式かチェック
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
    if (!regex.test(value)) {
        return '誕生日はMM/DD形式（例:05/15）で入力してください';
    }

    // 日付として妥当かチェック（2月30日などの無効な日付をチェック）
    const [month, day] = value.split('/').map(num => parseInt(num, 10));
    const testDate = new Date(2020, month - 1, day); // うるう年を使用

    if (
        testDate.getMonth() !== month - 1 ||
        testDate.getDate() !== day
    ) {
        return '無効な日付です';
    }

    return null;
}

/**
 * 年のバリデーション（1900〜現在+10年の範囲内）
 * @param {string} value - 検証する値
 * @returns {string|null} エラーメッセージまたはnull
 */
export function validateYear(value) {
    if (!value) return null; // 空の場合はOK（必須でない場合）

    // 数値かチェック
    if (!/^\d{4}$/.test(value)) {
        return '年は4桁の数字で入力してください';
    }

    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();

    if (year < 1900 || year > currentYear + 10) {
        return `年は1900〜${currentYear + 10}の間で入力してください`;
    }

    return null;
}

/**
 * URLのバリデーション
 * @param {string} value - 検証する値
 * @returns {string|null} エラーメッセージまたはnull
 */
export function validateUrl(value) {
    if (!value) return null; // 空の場合はOK（必須でない場合）

    try {
        new URL(value);
        return null;
    } catch (e) {
        return '有効なURLを入力してください（例: https://example.com）';
    }
}

/**
 * ISO形式の日付から年月日のフォーマットで表示
 * @param {string} isoDate - ISO形式の日付文字列
 * @returns {string} YYYY/MM/DD形式の文字列
 */
export function formatDate(isoDate) {
    if (!isoDate) return '';

    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}/${month}/${day}`;
}

/**
 * 日付文字列から曜日を取得
 * @param {string} dateString - 日付文字列
 * @returns {string} 曜日（日, 月, 火, 水, 木, 金, 土）
 */
export function getWeekday(dateString) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const date = new Date(dateString);
    return weekdays[date.getDay()];
}

/**
 * 時間文字列（例: "14:00～"）からHoursとMinutesを抽出
 * @param {string} timeString - 時間文字列
 * @returns {{hours: number, minutes: number}|null} 時間と分、抽出できない場合はnull
 */
export function parseTimeString(timeString) {
    if (!timeString) return null;

    // 時間部分を抽出（数字とコロンを含む部分を取得）
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;

    // 時分を返す
    return {
        hours: parseInt(timeMatch[1], 10),
        minutes: parseInt(timeMatch[2], 10)
    };
}

/**
 * フォームデータ整形用ヘルパー関数
 * @param {Object} data - 整形するデータオブジェクト
 * @param {Array} dateFields - 日付形式に変換するフィールド名の配列
 * @returns {Object} 整形されたデータ
 */
export function formatFormData(data, dateFields = []) {
    const formattedData = { ...data };

    // 日付フィールドをISO形式に変換
    dateFields.forEach(field => {
        if (formattedData[field]) {
            formattedData[field] = new Date(formattedData[field]).toISOString();
        }
    });

    return formattedData;
}