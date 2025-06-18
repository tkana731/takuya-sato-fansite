import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // /indexへのアクセスをルートにリダイレクト
  if (url.pathname === '/index' || url.pathname === '/index.html') {
    url.pathname = '/';
    return NextResponse.redirect(url, 301);
  }
  
  // 正規URLを設定（www なしに統一）
  if (url.hostname === 'www.takuya-sato-fansite.com') {
    url.hostname = 'takuya-sato-fansite.com';
    return NextResponse.redirect(url, 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // /indexパターンのみマッチ
    '/index',
    '/index.html',
    // すべてのパスでwww対応
    '/(.*)',
  ],
};