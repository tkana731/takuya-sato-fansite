// pages/admin/roles/[id]/edit.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function EditRole() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const { id } = router.query;
    const [submitting, setSubmitting] = useState(false);
    const [roleData, setRoleData] = useState(null);
    const [actors, setActors] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // 役割データと声優データの取得
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setDataLoading(true);

                // 声優データを取得
                const { data: actorData, error: actorError } = await supabase
                    .from('mst_actors')
                    .select('id, name')
                    .order('name', { ascending: true });

                if (actorError) throw actorError;

                // 役割データを取得
                const { data: roleData, error: roleError } = await supabase
                    .from('mst_roles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (roleError) throw roleError;

                // データをフォーム用に整形
                const formattedData = {
                    id: roleData.id,
                    name: roleData.name,
                    actorId: roleData.actor_id || '',
                    birthday: roleData.birthday || '',
                    seriesName: roleData.series_name || ''
                };

                setRoleData(formattedData);
                setActors(actorData || []);
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
            // 役割データを更新
            const { error } = await supabase
                .from('mst_roles')
                .update({
                    name: values.name,
                    actor_id: values.actorId || null,
                    birthday: values.birthday || null,
                    series_name: values.seriesName || null
                })
                .eq('id', id);

            if (error) throw error;

            // 成功時は一覧ページへリダイレクト
            router.push('/admin/roles');
        } catch (error) {
            console.error('役割更新エラー:', error);
            alert('役割の更新に失敗しました: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // 誕生日のバリデーション
    const validateBirthday = (value) => {
        if (!value) return null;

        // MM/DD形式かチェック
        const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
        if (!regex.test(value)) {
            return '誕生日はMM/DD形式（例:05/15）で入力してください';
        }
        return null;
    };

    // フォームフィールド定義
    const formFields = [
        {
            name: 'name',
            label: '役割名',
            type: 'text',
            required: true,
            placeholder: '役割の名前を入力（例: 十龍之介）',
            span: 'sm:col-span-6',
        },
        {
            name: 'actorId',
            label: '声優',
            type: 'select',
            required: true,
            options: actors.map(actor => ({
                value: actor.id,
                label: actor.name,
            })),
            span: 'sm:col-span-3',
            placeholder: '声優を選択',
            help: '通常は佐藤拓也を選択します'
        },
        {
            name: 'seriesName',
            label: '作品/シリーズ名',
            type: 'text',
            placeholder: '作品名かシリーズ名を入力（例: IDOLiSH7）',
            span: 'sm:col-span-3',
        },
        {
            name: 'birthday',
            label: '誕生日',
            type: 'text',
            placeholder: 'MM/DD形式で入力（例: 05/15）',
            span: 'sm:col-span-3',
            help: '誕生日がある場合のみ入力',
            validate: validateBirthday
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
                <title>役割編集 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">役割編集</h1>
                    <p className="text-gray-600">役割情報を編集します</p>
                </div>

                {roleData && (
                    <FormBuilder
                        fields={formFields}
                        initialValues={roleData}
                        onSubmit={handleSubmit}
                        title="役割情報"
                        submitButtonText="更新する"
                        cancelHref="/admin/roles"
                        isSubmitting={submitting}
                    />
                )}
            </div>
        </AdminLayout>
    );
}