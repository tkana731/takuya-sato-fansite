// pages/admin/videos/new.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FormBuilder from '../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../hooks/useProtectedRoute';
import { supabase } from '../../../lib/supabase';
import axios from 'axios';

export default function NewVideo() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [works, setWorks] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 作品データの取得（関連付け用）
    useEffect(() => {
        const fetchWorks = async () => {
            try {
                setDataLoading(true);

                // 作品データを取得
                const { data, error } = await supabase
                    .from('works')
                    .select('id, title')
                    .order('title', { ascending: true });

                if (error) throw error;

                setWorks(data || []);
            } catch (error) {
                console.error('作品データの取得エラー:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchWorks();
    }, []);

    // フォーム送信
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // APIを使用して動画データを作成
            const response = await axios.post('/api/videos/create', {
                title: values.title,
                workId: values.workId || null,
                videoUrl: values.videoUrl,
                publishedAt: values.publishedAt
            });

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            // 成功時は一覧ページへリダイレクト
            router.push('/admin/videos');
        } catch (error) {
            console.error('動画登録エラー:', error);
            alert('動画の登録に失敗しました: ' + (error.response?.data?.message || error.message));
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
                <title>新規動画追加 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">新規動画追加</h1>
                    <p className="text-gray-600">YouTubeなどの動画リンクを追加します</p>
                </div>

                <FormBuilder
                    fields={formFields}
                    onSubmit={handleSubmit}
                    title="動画情報"
                    submitButtonText="動画を登録"
                    cancelHref="/admin/videos"
                    isSubmitting={submitting}
                />
            </div>
        </AdminLayout>
    );
}