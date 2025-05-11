// pages/admin/videos/[id]/edit.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function EditVideo() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const { id } = router.query;
    const [submitting, setSubmitting] = useState(false);
    const [videoData, setVideoData] = useState(null);
    const [works, setWorks] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 動画データと作品データの取得
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setDataLoading(true);

                // 動画データを取得
                const { data: videoData, error: videoError } = await supabase
                    .from('videos')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (videoError) throw videoError;

                // 作品データを取得（関連付け用）
                const { data: worksData, error: worksError } = await supabase
                    .from('works')
                    .select('id, title')
                    .order('title', { ascending: true });

                if (worksError) throw worksError;

                // データをフォーム用に整形
                const formattedData = {
                    id: videoData.id,
                    title: videoData.title,
                    workId: videoData.work_id || '',
                    videoUrl: videoData.video_url,
                    publishedAt: videoData.published_at ? new Date(videoData.published_at).toISOString().split('T')[0] : ''
                };

                setVideoData(formattedData);
                setWorks(worksData || []);
            } catch (error) {
                console.error('データの取得エラー:', error);
                alert('データの取得に失敗しました');
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // フォーム送信
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // 日付データの変換
            const publishedDate = new Date(values.publishedAt);

            // 動画データを更新
            const { error } = await supabase
                .from('videos')
                .update({
                    title: values.title,
                    work_id: values.workId || null,
                    video_url: values.videoUrl,
                    published_at: publishedDate
                })
                .eq('id', id);

            if (error) throw error;

            // 成功時は一覧ページへリダイレクト
            router.push('/admin/videos');
        } catch (error) {
            console.error('動画更新エラー:', error);
            alert('動画の更新に失敗しました: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'title',
            label: 'タイトル',
            type: 'text',
            required: true,
            placeholder: '動画のタイトルを入力',
            span: 'sm:col-span-6',
        },
        {
            name: 'videoUrl',
            label: '動画URL',
            type: 'text',
            required: true,
            placeholder: 'https://www.youtube.com/watch?v=example',
            span: 'sm:col-span-6',
            help: 'YouTubeやその他の動画プラットフォームのURLを入力してください。'
        },
        {
            name: 'publishedAt',
            label: '公開日',
            type: 'date',
            required: true,
            span: 'sm:col-span-3',
        },
        {
            name: 'workId',
            label: '関連作品',
            type: 'select',
            options: works.map(work => ({
                value: work.id,
                label: work.title,
            })),
            span: 'sm:col-span-3',
            placeholder: '関連作品を選択（任意）',
        },
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
                <title>動画編集 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">動画編集</h1>
                    <p className="text-gray-600">動画情報を編集します</p>
                </div>

                {videoData && (
                    <FormBuilder
                        fields={formFields}
                        initialValues={videoData}
                        onSubmit={handleSubmit}
                        title="動画情報"
                        submitButtonText="更新する"
                        cancelHref="/admin/videos"
                        isSubmitting={submitting}
                    />
                )}
            </div>
        </AdminLayout>
    );
}