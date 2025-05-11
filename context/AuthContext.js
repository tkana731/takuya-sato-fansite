import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // 現在のセッションを取得
        const initializeAuth = async () => {
            setLoading(true);

            // 現在のセッションを取得
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            if (currentSession) {
                setSession(currentSession);
                setUser(currentSession.user);

                // app_metadataからロールを取得
                const role = currentSession.user.app_metadata?.role || null;
                setIsAdmin(role === 'admin');

                // デバッグ情報
                console.log('認証情報:', {
                    user: currentSession.user,
                    app_metadata: currentSession.user.app_metadata,
                    user_metadata: currentSession.user.user_metadata,
                    role: role
                });
            }

            setLoading(false);
        };

        initializeAuth();

        // 認証状態変更のリスナー
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event);

            setSession(newSession);
            setUser(newSession?.user || null);

            if (newSession?.user) {
                const role = newSession.user.app_metadata?.role || null;
                setIsAdmin(role === 'admin');

                // デバッグ情報
                console.log('認証情報更新:', {
                    user: newSession.user,
                    app_metadata: newSession.user.app_metadata,
                    user_metadata: newSession.user.user_metadata,
                    role: role
                });
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    // ログイン関数
    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('ログインエラー:', error);
            throw error;
        }
    };

    // ログアウト関数
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('ログアウトエラー:', error);
            throw error;
        }
    };

    // パスワードリセット関数
    const resetPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/update-password`,
            });

            if (error) throw error;
        } catch (error) {
            console.error('パスワードリセットエラー:', error);
            throw error;
        }
    };

    // 新しいパスワードの設定
    const updatePassword = async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;
        } catch (error) {
            console.error('パスワード更新エラー:', error);
            throw error;
        }
    };

    const value = {
        user,
        session,
        loading,
        isAdmin,
        login,
        logout,
        resetPassword,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}