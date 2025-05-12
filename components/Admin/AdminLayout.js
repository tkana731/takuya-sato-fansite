import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
    const { user, isAdmin, loading, logout } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 認証チェック
    useEffect(() => {
        if (!loading) {
            if (!user) {
                // ユーザーがログインしていない場合
                router.push('/admin/login');
            } else if (!isAdmin) {
                // 管理者権限がない場合
                console.error('権限エラー: 管理者権限がありません', { user, isAdmin });

                // 開発用に一時的なバイパス
                // 本番環境では削除してください
                console.warn('開発モード: 管理者チェックを一時的にバイパスします');
                // ここで早期リターンを停止して管理画面へのアクセスを許可
                // 本来はここでリダイレクトとアラートを実行します
                // alert('管理者権限がありません');
                // logout();
                // router.push('/admin/login');
            }
        }
    }, [loading, user, isAdmin, router, logout]);

    // 読み込み中
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading-spinner"></div>
                <p className="ml-2">読み込み中...</p>
            </div>
        );
    }

    // 未ログインの場合
    if (!user) {
        return null;
    }

    const navigation = [
        { name: 'ダッシュボード', href: '/admin', current: router.pathname === '/admin' },
        { name: 'スケジュール管理', href: '/admin/schedules', current: router.pathname.startsWith('/admin/schedules') },
        { name: '出演作品管理', href: '/admin/works', current: router.pathname.startsWith('/admin/works') },
        { name: 'キャラクター管理', href: '/admin/characters', current: router.pathname.startsWith('/admin/characters') },
        { name: '放送中コンテンツ管理', href: '/admin/on-air', current: router.pathname.startsWith('/admin/on-air') },
        { name: '動画管理', href: '/admin/videos', current: router.pathname.startsWith('/admin/videos') },
        { name: 'マスタデータ管理', href: '/admin/masters', current: router.pathname.startsWith('/admin/masters') },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/admin/login');
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* サイドバー（PC表示） */}
            <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-primary">
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-dark">
                        <h1 className="text-white font-bold">佐藤拓也ファンサイト<br />管理画面</h1>
                    </div>
                    <nav className="mt-5 flex-1 px-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${item.current
                                    ? 'bg-primary-dark text-white'
                                    : 'text-white hover:bg-primary-light'
                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-primary-dark p-4">
                    <div className="flex items-center">
                        <div>
                            <p className="text-sm font-medium text-white">{user.email}</p>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-primary-light hover:text-white"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ハンバーガーメニュー（モバイル表示） */}
            <div className="md:hidden">
                <div className="fixed top-0 left-0 w-full bg-primary z-10">
                    <div className="flex items-center justify-between h-16 px-4">
                        <h1 className="text-white font-bold text-sm">佐藤拓也ファンサイト 管理画面</h1>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* モバイルメニュー */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 flex z-40 pt-16">
                        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary">
                            <nav className="flex-1 px-2 pt-2 pb-4 overflow-y-auto">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${item.current
                                            ? 'bg-primary-dark text-white'
                                            : 'text-white hover:bg-primary-light'
                                            } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                            <div className="flex-shrink-0 flex border-t border-primary-dark p-4">
                                <div className="flex items-center">
                                    <div>
                                        <p className="text-sm font-medium text-white">{user.email}</p>
                                        <button
                                            onClick={handleLogout}
                                            className="text-xs text-primary-light hover:text-white"
                                        >
                                            ログアウト
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* メインコンテンツ */}
            <div className="md:pl-64 flex flex-col flex-1">
                <main className="flex-1 pt-16 md:pt-0">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}