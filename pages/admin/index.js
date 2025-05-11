import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/Admin/AdminLayout';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
    const { user, isAdmin, loading } = useAuth();
    const [stats, setStats] = useState({
        scheduleCount: 0,
        worksCount: 0,
        birthdayCount: 0,
        videoCount: 0
    });
    const [dataLoading, setDataLoading] = useState(true);

    // 統計情報の取得
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            try {
                setDataLoading(true);

                // スケジュール数を取得
                const { count: scheduleCount, error: scheduleError } = await supabase
                    .from('schedules')
                    .select('id', { count: 'exact', head: true });

                if (scheduleError) throw scheduleError;

                // 作品数を取得
                const { count: worksCount, error: worksError } = await supabase
                    .from('works')
                    .select('id', { count: 'exact', head: true });

                if (worksError) throw worksError;

                // 誕生日キャラクター数を取得 - カラム名の修正
                const { count: birthdayCount, error: birthdayError } = await supabase
                    .from('mst_roles')
                    .select('id', { count: 'exact', head: true })
                    .not('birthday', 'is', null);

                if (birthdayError) throw birthdayError;

                // 動画数を取得
                const { count: videoCount, error: videoError } = await supabase
                    .from('videos')
                    .select('id', { count: 'exact', head: true });

                if (videoError) throw videoError;

                setStats({
                    scheduleCount: scheduleCount || 0,
                    worksCount: worksCount || 0,
                    birthdayCount: birthdayCount || 0,
                    videoCount: videoCount || 0
                });
            } catch (error) {
                console.error('統計情報の取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    // 最近の更新を取得
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchRecentActivities = async () => {
            if (!user) return;

            try {
                // 最近追加されたレコードを取得する例
                // 実際のアプリケーションでは、アクティビティログテーブルを用意するのが理想的

                // スケジュール - created_atをcreatedAtに変更
                const { data: recentSchedules, error: scheduleError } = await supabase
                    .from('schedules')
                    .select('id, title, createdAt') // created_at → createdAt
                    .order('createdAt', { ascending: false }) // created_at → createdAt
                    .limit(3);

                if (scheduleError) throw scheduleError;

                // 作品 - created_atをcreatedAtに変更
                const { data: recentWorks, error: worksError } = await supabase
                    .from('works')
                    .select('id, title, createdAt') // created_at → createdAt
                    .order('createdAt', { ascending: false }) // created_at → createdAt
                    .limit(3);

                if (worksError) throw worksError;

                // 動画 - created_atをcreatedAtに変更
                const { data: recentVideos, error: videosError } = await supabase
                    .from('videos')
                    .select('id, title, createdAt') // created_at → createdAt
                    .order('createdAt', { ascending: false }) // created_at → createdAt
                    .limit(3);

                if (videosError) throw videosError;

                // データの統合と並べ替え
                const allActivities = [
                    ...recentSchedules.map(item => ({
                        ...item,
                        type: 'schedule',
                        description: `スケジュール「${item.title}」を追加`
                    })),
                    ...recentWorks.map(item => ({
                        ...item,
                        type: 'work',
                        description: `作品「${item.title}」を追加`
                    })),
                    ...recentVideos.map(item => ({
                        ...item,
                        type: 'video',
                        description: `動画「${item.title}」を追加`
                    }))
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

                setRecentActivities(allActivities);
            } catch (error) {
                console.error('最近の更新取得エラー:', error);
            }
        };

        fetchRecentActivities();
    }, [user]);

    if (loading || dataLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="loading-spinner"></div>
                    <p className="ml-2">読み込み中...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Head>
                <title>管理ダッシュボード | 佐藤拓也ファンサイト</title>
            </Head>
            <div className="py-4">
                <h1 className="text-2xl font-bold text-primary mb-6">管理ダッシュボード</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900">スケジュール</h2>
                        <p className="text-3xl font-bold text-primary mt-2">{stats.scheduleCount}</p>
                        <Link href="/admin/schedules" className="text-sm text-accent hover:underline mt-2 inline-block">
                            管理ページへ →
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900">出演作品</h2>
                        <p className="text-3xl font-bold text-primary mt-2">{stats.worksCount}</p>
                        <Link href="/admin/works" className="text-sm text-accent hover:underline mt-2 inline-block">
                            管理ページへ →
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900">誕生日キャラクター</h2>
                        <p className="text-3xl font-bold text-primary mt-2">{stats.birthdayCount}</p>
                        <Link href="/admin/birthdays" className="text-sm text-accent hover:underline mt-2 inline-block">
                            管理ページへ →
                        </Link>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900">動画</h2>
                        <p className="text-3xl font-bold text-primary mt-2">{stats.videoCount}</p>
                        <Link href="/admin/videos" className="text-sm text-accent hover:underline mt-2 inline-block">
                            管理ページへ →
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">最近の更新</h2>
                    <div className="border-t border-gray-200">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => (
                                <div key={`${activity.type}-${activity.id}`} className={`py-3 ${index > 0 ? 'border-t border-gray-200' : ''} flex justify-between`}>
                                    <div>
                                        <p className="text-sm font-medium">{activity.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(activity.created_at).toLocaleString('ja-JP', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${activity.type === 'schedule' ? 'bg-orange-100 text-orange-800' :
                                        activity.type === 'work' ? 'bg-blue-100 text-blue-800' :
                                            activity.type === 'video' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {activity.type === 'schedule' ? 'スケジュール' :
                                            activity.type === 'work' ? '作品' :
                                                activity.type === 'video' ? '動画' : activity.type}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="py-3 text-sm text-gray-500">最近の更新はありません</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックリンク</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/admin/schedules/new" className="text-primary hover:underline">新規スケジュール追加</Link>
                        <Link href="/admin/works/new" className="text-primary hover:underline">新規作品追加</Link>
                        <Link href="/admin/birthdays/new" className="text-primary hover:underline">誕生日キャラクター追加</Link>
                        <Link href="/admin/videos/new" className="text-primary hover:underline">新規動画追加</Link>
                        <Link href="/admin/masters" className="text-primary hover:underline">マスタデータ管理</Link>
                        <Link href="/" target="_blank" className="text-primary hover:underline">公開サイトを表示</Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}