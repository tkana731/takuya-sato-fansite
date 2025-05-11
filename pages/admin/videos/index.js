// pages/admin/videos/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/Admin/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';
import axios from 'axios';

export default function VideosAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const [videos, setVideos] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 動画データの取得
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setDataLoading(true);

                // 動画データを取得
                const { data, error } = await supabase
                    .from('videos')
                    .select(`
                        id, 
                        title, 
                        video_url,
                        published_at,
                        work:work_id (id, title)
                    `)
                    .order('published_at', { ascending: false });

                if (error) throw error;

                console.log('取得した動画:', data);

                // データを整形
                const formattedVideos = data.map(video => {
                    const publishedDate = new Date(video.published_at);
                    const formattedDate = `${publishedDate.getFullYear()}/${(publishedDate.getMonth() + 1).toString().padStart(2, '0')}/${publishedDate.getDate().toString().padStart(2, '0')}`;

                    return {
                        id: video.id,
                        title: video.title,
                        videoUrl: video.video_url,
                        publishedAt: formattedDate,
                        relatedWork: video.work?.title || 'なし'
                    };
                });

                setVideos(formattedVideos);
            } catch (error) {
                console.error('動画の取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // 動画削除
    const handleDelete = async (id) => {
        try {
            // APIを使用して動画を削除
            const response = await axios.delete(`/api/videos/${id}`);

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            // 削除成功時は一覧から削除
            setVideos(videos.filter(video => video.id !== id));
        } catch (error) {
            console.error('動画削除エラー:', error);
            alert('削除処理中にエラーが発生しました: ' + (error.response?.data?.message || error.message));
        }
    };

    // テーブルのカラム定義
    const columns = [
        {
            key: 'title',
            label: 'タイトル',
        },
        {
            key: 'publishedAt',
            label: '公開日',
        },
        {
            key: 'relatedWork',
            label: '関連作品',
        },
        {
            key: 'videoUrl',
            label: '動画URL',
            render: (item) => (
                <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block max-w-xs"
                >
                    {item.videoUrl}
                </a>
            )
        }
    ];

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
                <title>動画管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">動画管理</h1>
                    <p className="text-gray-600">YouTubeなどの動画リンクを管理します</p>
                </div>

                <DataTable
                    data={videos}
                    columns={columns}
                    title="動画一覧"
                    addButtonLink="/admin/videos/new"
                    addButtonText="新規動画追加"
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayout>
    );
}