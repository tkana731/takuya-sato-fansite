// components/Admin/CommonCrud.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from './AdminLayout';
import FormBuilder from './FormBuilder';
import { createData, updateData } from '../../lib/api-helpers';

/**
 * 汎用的なデータ作成コンポーネント
 */
export function CreatePage({
    title,
    description,
    tableName,
    apiEndpoint,
    formFields,
    transformData,
    redirectPath,
    isProtected = true,
    pageTitle = null,
}) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // フォーム送信処理
    const handleSubmit = async (values) => {
        setSubmitting(true);
        setError(null);

        try {
            // データ変換がある場合は適用
            const dataToSubmit = transformData ? transformData(values) : values;

            let result;
            if (apiEndpoint) {
                // API経由で保存
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSubmit),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '登録に失敗しました');
                }

                result = await response.json();
            } else {
                // 直接Supabaseに保存
                result = await createData(tableName, dataToSubmit);
            }

            if (!result.success) {
                throw new Error(result.message || '登録に失敗しました');
            }

            // 成功時はリダイレクト
            router.push(redirectPath);
        } catch (err) {
            console.error('データ登録エラー:', err);
            setError(`登録に失敗しました: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>{pageTitle || `新規${title}追加`} | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">{`新規${title}追加`}</h1>
                    <p className="text-gray-600">{description}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <FormBuilder
                    fields={formFields}
                    onSubmit={handleSubmit}
                    title={`${title}情報`}
                    submitButtonText={`${title}を登録`}
                    cancelHref={redirectPath}
                    isSubmitting={submitting}
                />
            </div>
        </AdminLayout>
    );
}

/**
 * 汎用的なデータ編集コンポーネント
 */
export function EditPage({
    title,
    description,
    tableName,
    apiEndpoint,
    formFields,
    transformData,
    redirectPath,
    data,
    dataLoading,
    isProtected = true,
    pageTitle = null,
}) {
    const router = useRouter();
    const { id } = router.query;
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // フォーム送信処理
    const handleSubmit = async (values) => {
        setSubmitting(true);
        setError(null);

        try {
            // データ変換がある場合は適用
            const dataToSubmit = transformData ? transformData(values) : values;

            let result;
            if (apiEndpoint) {
                // API経由で更新
                const response = await fetch(`${apiEndpoint}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSubmit),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '更新に失敗しました');
                }

                result = await response.json();
            } else {
                // 直接Supabaseで更新
                result = await updateData(tableName, id, dataToSubmit);
            }

            if (!result.success) {
                throw new Error(result.message || '更新に失敗しました');
            }

            // 成功時はリダイレクト
            router.push(redirectPath);
        } catch (err) {
            console.error('データ更新エラー:', err);
            setError(`更新に失敗しました: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>{pageTitle || `${title}編集`} | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">{`${title}編集`}</h1>
                    <p className="text-gray-600">{description}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {dataLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loading-spinner"></div>
                        <p className="ml-2">読み込み中...</p>
                    </div>
                ) : (
                    data && (
                        <FormBuilder
                            fields={formFields}
                            initialValues={data}
                            onSubmit={handleSubmit}
                            title={`${title}情報`}
                            submitButtonText="更新する"
                            cancelHref={redirectPath}
                            isSubmitting={submitting}
                        />
                    )
                )}
            </div>
        </AdminLayout>
    );
}

/**
 * 汎用的なリスト表示ページ
 */
export function ListPage({
    title,
    description,
    dataTable,
    isProtected = true,
    pageTitle = null,
}) {
    return (
        <AdminLayout>
            <Head>
                <title>{pageTitle || `${title}管理`} | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">{`${title}管理`}</h1>
                    <p className="text-gray-600">{description}</p>
                </div>

                {dataTable}
            </div>
        </AdminLayout>
    );
}