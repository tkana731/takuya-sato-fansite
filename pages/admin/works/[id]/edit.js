// pages/admin/works/[id]/edit.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';
import axios from 'axios';

export default function EditWork() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const { id } = router.query;
    const [submitting, setSubmitting] = useState(false);
    const [workData, setWorkData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 作品データとカテゴリデータの取得
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setDataLoading(true);

                // カテゴリを取得
                const { data: categoryData, error: categoryError } = await supabase
                    .from('mst_work_categories')
                    .select('id, name, display_order')
                    .order('display_order', { ascending: true });

                if (categoryError) throw categoryError;

                // APIを使用して作品データを取得
                const response = await axios.get(`/api/works/${id}`);
                if (!response.data.success) {
                    throw new Error(response.data.message);
                }

                const workData = response.data.data;

                // データをフォーム用に整形
                const formattedData = {
                    id: workData.id,
                    title: workData.title,
                    categoryId: workData.category_id,
                    year: workData.year ? String(workData.year) : '',
                    description: workData.description || '',
                    officialUrl: workData.officialUrl || ''
                };

                setWorkData(formattedData);
                setCategories(categoryData || []);
            } catch (error) {
                console.error('データの取得エラー:', error);
                alert('データの取得に失敗しました: ' + (error.response?.data?.message || error.message));
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
            // APIを使用して作品データを更新
            const response = await axios.put(`/api/works/${id}`, {
                title: values.title,
                categoryId: values.categoryId,
                year: values.year,
                description: values.description,
                officialUrl: values.officialUrl
            });

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            // 成功時は一覧ページへリダイレクト
            router.push('/admin/works');
        } catch (error) {
            console.error('作品更新エラー:', error);
            alert('作品の更新に失敗しました: ' + (error.response?.data?.message || error.message));
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
            placeholder: '作品のタイトルを入力',
            span: 'sm:col-span-6',
        },
        {
            name: 'categoryId',
            label: 'カテゴリ',
            type: 'select',
            required: true,
            options: categories.map(category => ({
                value: category.id,
                label: category.name,
            })),
            span: 'sm:col-span-3',
            placeholder: 'カテゴリを選択',
        },
        {
            name: 'year',
            label: '年',
            type: 'text',
            span: 'sm:col-span-3',
            placeholder: '2025',
            help: '作品の公開年（数字4桁）'
        },
        {
            name: 'description',
            label: '説明',
            type: 'textarea',
            span: 'sm:col-span-6',
            placeholder: '作品の説明',
            rows: 4,
        },
        {
            name: 'officialUrl',
            label: '公式URL',
            type: 'text',
            placeholder: 'https://example.com',
            span: 'sm:col-span-6',
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
                <title>作品編集 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">作品編集</h1>
                    <p className="text-gray-600">作品情報を編集します</p>
                </div>

                {workData && (
                    <FormBuilder
                        fields={formFields}
                        initialValues={workData}
                        onSubmit={handleSubmit}
                        title="作品情報"
                        submitButtonText="更新する"
                        cancelHref="/admin/works"
                        isSubmitting={submitting}
                    />
                )}
            </div>
        </AdminLayout>
    );
}