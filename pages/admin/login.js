import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { session, user } = await login(email, password);

            console.log('ログイン成功:', { session, user });

            // ユーザーにapp_metadataがあり、roleがadminの場合
            if (user?.app_metadata?.role === 'admin') {
                router.push('/admin');
            } else {
                // 管理者でない場合
                setError('この機能を使用するには管理者権限が必要です');
                console.warn('管理者権限なし:', user);
            }

        } catch (error) {
            console.error('ログインエラー:', error);
            setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>管理者ログイン | 佐藤拓也ファンサイト</title>
            </Head>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-center text-primary mb-6">
                        佐藤拓也ファンサイト<br />管理者ログイン
                    </h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                パスワード
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            >
                                {loading ? 'ログイン中...' : 'ログイン'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}