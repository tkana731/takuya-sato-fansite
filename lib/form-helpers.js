// lib/form-helpers.js

/**
 * 日付を日本語の曜日に変換する関数
 * @param {Date} date - Dateオブジェクト
 * @returns {string} 日本語の曜日（例: "月", "火"）
 */
export function getWeekday(date) {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return weekdays[date.getDay()];
}

/**
 * 日付をYYYY-MM-DD形式にフォーマットする関数
 * @param {Date} date - Dateオブジェクト
 * @returns {string} YYYY-MM-DD形式の文字列
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 日付を表示用にフォーマットする関数
 * @param {Date} date - Dateオブジェクト
 * @returns {string} YYYY.MM.DD形式の文字列
 */
export function formatDateForDisplay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 時刻をHH:MM形式にフォーマットする関数
 * @param {Date} date - Dateオブジェクト
 * @returns {string} HH:MM形式の文字列
 */
export function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 日本時間（JST）のDateオブジェクトを取得する関数
 * @returns {Date} 日本時間のDateオブジェクト
 */
export function getJSTDate() {
  const utcDate = new Date();
  const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換
  return new Date(utcDate.getTime() + jstOffset);
}

/**
 * UTCからJSTに変換する関数
 * @param {Date} utcDate - UTCのDateオブジェクト
 * @returns {Date} JSTのDateオブジェクト
 */
export function convertUTCtoJST(utcDate) {
  const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換
  return new Date(utcDate.getTime() + jstOffset);
}

/**
 * フォーム入力値をサニタイズする関数
 * @param {string} value - サニタイズする値
 * @returns {string} サニタイズされた値
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>]/g, '');
}

/**
 * メールアドレスの形式をチェックする関数
 * @param {string} email - チェックするメールアドレス
 * @returns {boolean} 有効な形式かどうか
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 日付文字列の形式をチェックする関数（YYYY-MM-DD）
 * @param {string} dateString - チェックする日付文字列
 * @returns {boolean} 有効な形式かどうか
 */
export function isValidDateString(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * 時刻文字列の形式をチェックする関数（HH:MM）
 * @param {string} timeString - チェックする時刻文字列
 * @returns {boolean} 有効な形式かどうか
 */
export function isValidTimeString(timeString) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}