// pages/admin/characters/[id]/edit.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/Admin/AdminLayout';
import FormBuilder from '../../../../components/Admin/FormBuilder';
import useProtectedRoute from '../../../../hooks/useProtectedRoute';
import { supabase } from '../../../../lib/supabase';

export default function EditCharacter() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);
    const router = useRouter();
    const { id } = router.query;
    const [submitting, setSubmitting] = useState(false);
    const [characterData, setCharacterData] = useState(null);
    const [actors, setActors] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // キャラクターデータと声優データの取得
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

                // キャラクターを取得
                const { data, error } = await supabase
                    .from('mst_roles')
                    .select(`
                        id, 
                        name, 
                        birthday,
                        series_name,
                        actor:actor_id (id, name)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // データをフォーム用に整形
                const formattedData = {
                    id: data.id,
                    name: data.name,
                    actorId: data.actor?.id || '',
                    seriesName: data.series_name || '',
                    birthday: data.birthday || ''
                };

                setCharacterData(formattedData);
                setActors(actorData || []);
            } catch (error) {
                console.error('データの取得エラー:', error);
                alert('データの取得に失敗しました');
                router.push('/admin/characters');
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    // フォーム送信
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // 誕生日のバリデーション（存在する場合）
            if (values.birthday) {
                const birthdayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
                if (!birthdayRegex.test(values.birthday)) {
                    throw new Error('誕生日はMM/DD形式（例:05/15）で入力してください');
                }
            }

            // キャラクターを更新
            const { error } = await supabase
                .from('mst_roles')
                .update({
                    name: values.name,
                    actor_id: values.actorId,
                    series_name: values.seriesName || null,
                    birthday: values.birthday || null
                })
                .eq('id', id);

            if (error) throw error;

            // 成功時は一覧ページへリダイレクト
            router.push('/admin/characters');
        } catch (error) {
            console.error('キャラクター更新エラー:', error);
            alert('キャラクターの更新に失敗しました: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // 誕生日のバリデーション
    const validateBirthday = (value) => {
        if (!value) return null; // 誕生日は任意項目

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
            label: 'キャラクター名',
            type: 'text',
            required: true,
            placeholder: 'キャラクターの名前を入力',
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
            label: '誕生日（任意）',
            type: 'text',
            placeholder: 'MM/DD形式で入力（例: 05/15）',
            span: 'sm:col-span-3',
            validate: validateBirthday,
            help: '誕生日は月/日の形式で入力してください。例: 1月1日→01/01, 12月25日→12/25'
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
                <title>キャラクター編集 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">キャラクター編集</h1>
                    <p className="text-gray-600">キャラクター情報を編集します</p>
                </div>

                {characterData && (
                    <FormBuilder
                        fields={formFields}
                        initialValues={characterData}
                        onSubmit={handleSubmit}
                        title="キャラクター情報"
                        submitButtonText="更新する"
                        cancelHref="/admin/characters"
                        isSubmitting={submitting}
                    />
                )}
            </div>
        </AdminLayout>
    );
}