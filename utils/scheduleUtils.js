// utils/scheduleUtils.js

/**
 * 日本時間での時間処理を行うユーティリティ関数
 */

// 日本時間のオフセット（9時間をミリ秒で表現）
const JST_OFFSET = 9 * 60 * 60 * 1000;

/**
 * 曜日を取得する関数
 * @param {Date} date - 日付オブジェクト
 * @returns {string} 曜日（日, 月, 火, 水, 木, 金, 土）
 */
export const getWeekday = (date) => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[date.getDay()];
};

/**
 * UTC時間を日本時間に変換
 * @param {string|Date} utcDateTime - UTC時間
 * @returns {Date} 日本時間のDateオブジェクト
 */
export const convertToJST = (utcDateTime) => {
    const utcDate = new Date(utcDateTime);
    return new Date(utcDate.getTime() + JST_OFFSET);
};

/**
 * 日本時間から時間文字列を抽出（HH:mm形式）
 * @param {Date} jstDate - 日本時間のDateオブジェクト
 * @returns {string} HH:mm形式の時間文字列
 */
export const extractTimeString = (jstDate) => {
    const jstString = jstDate.toISOString();
    const [, timePart] = jstString.split('T');
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
};

/**
 * 日本時間から日付文字列を抽出（YYYY-MM-DD形式）
 * @param {Date} jstDate - 日本時間のDateオブジェクト
 * @returns {string} YYYY-MM-DD形式の日付文字列
 */
export const extractDateString = (jstDate) => {
    const jstString = jstDate.toISOString();
    const [datePart] = jstString.split('T');
    return datePart;
};

/**
 * スケジュールデータの時間情報を処理する共通関数
 * @param {Object} schedule - スケジュールオブジェクト
 * @returns {Object} 処理済みの時間情報
 */
export const processScheduleTimeInfo = (schedule) => {
    const startDate = new Date(schedule.start_datetime);
    const jstDate = convertToJST(startDate);
    
    // 基本的な時間情報
    const timeInfo = extractTimeString(jstDate);
    const formattedDate = extractDateString(jstDate);
    const weekday = getWeekday(jstDate);
    
    // 長期開催かどうかの判定
    const isLongTerm = schedule.end_datetime && 
        new Date(schedule.start_datetime).toDateString() !== new Date(schedule.end_datetime).toDateString();
    
    let endDateFormatted = null;
    let endTimeInfo = null;
    let periodStatus = null;
    
    if (isLongTerm) {
        const endDate = new Date(schedule.end_datetime);
        const jstEndDate = convertToJST(endDate);
        
        endDateFormatted = extractDateString(jstEndDate);
        endTimeInfo = extractTimeString(jstEndDate);
        
        // 期間状況の判定
        const now = new Date();
        const startDateOnly = new Date(jstDate.toISOString().split('T')[0] + 'T00:00:00.000Z');
        const endDateOnly = new Date(jstEndDate.toISOString().split('T')[0] + 'T23:59:59.999Z');
        
        if (now < startDateOnly) {
            periodStatus = 'upcoming'; // 開催前
        } else if (now > endDateOnly) {
            periodStatus = 'ended'; // 終了
        } else {
            periodStatus = 'ongoing'; // 開催中
        }
    }
    
    return {
        jstDate,
        timeInfo,
        formattedDate,
        weekday,
        isLongTerm,
        endDate: isLongTerm ? convertToJST(schedule.end_datetime) : null,
        endDateFormatted,
        endTimeInfo,
        periodStatus
    };
};

/**
 * カテゴリコードを取得する関数
 * @param {Object} schedule - スケジュールオブジェクト
 * @returns {string} カテゴリコード
 */
export const getCategoryCode = (schedule) => {
    const categoryName = schedule.category?.name;
    const categoryMapping = {
        'イベント': 'event',
        '舞台・朗読': 'stage',
        '生放送': 'broadcast',
        '音声ガイド': 'voice_guide'
    };
    
    return categoryMapping[categoryName] || 'other';
};

/**
 * ロケーション情報を取得する関数
 * @param {Object} schedule - スケジュールオブジェクト
 * @returns {Object} ロケーション情報
 */
export const getLocationInfo = (schedule) => {
    const isBroadcast = schedule.category?.name === '生放送';
    
    const location = isBroadcast
        ? (schedule.broadcastStation ? schedule.broadcastStation.name : '')
        : (schedule.venue ? schedule.venue.name : '');
        
    const prefecture = !isBroadcast && schedule.venue?.prefecture_id?.name || null;
    const locationType = isBroadcast ? '放送/配信' : '会場';
    
    return {
        location,
        prefecture,
        locationType,
        isBroadcast
    };
};