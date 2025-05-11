import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function useProtectedRoute(adminOnly = false) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // ユーザーがログインしていない場合
            if (!user) {
                router.push('/admin/login');
            }
            // adminOnlyがtrueで、ユーザーがadminでない場合
            else if (adminOnly && !isAdmin) {
                alert('管理者権限がありません');
                router.push('/admin/login');
            }
        }
    }, [user, isAdmin, loading, router, adminOnly]);

    return { user, isAdmin, loading };
}