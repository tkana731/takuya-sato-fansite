import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from '../../../components/Admin/AdminLayout';
import useProtectedRoute from '../../../hooks/useProtectedRoute';

export default function MastersAdmin() {
    // 管理者のみアクセス可能
    const { loading } = useProtectedRoute(true);

    // マスタデータの一覧
    const masterDataList = [
        {
            id: 'schedule-categories',
            name: 'スケジュールカテゴリ',
            description: 'イベント、舞台、生放送などのスケジュールカテゴリを管理します',
            icon: 'calendar',
            href: '/admin/masters/schedule-categories'
        },
        {
            id: 'actors',
            name: '声優',
            description: '声優情報を管理します',
            icon: 'microphone',
            href: '/admin/masters/actors'
        },
        {
            id: 'work-categories',
            name: '作品カテゴリ',
            description: 'アニメ、ゲーム、吹き替えなどの作品カテゴリを管理します',
            icon: 'film',
            href: '/admin/masters/work-categories'
        },
        {
            id: 'station-types',
            name: '放送局タイプ',
            description: 'テレビ局、ラジオ局、配信サイトなどの放送局タイプを管理します',
            icon: 'tv',
            href: '/admin/masters/station-types'
        },
        {
            id: 'prefectures',
            name: '都道府県',
            description: '都道府県の一覧を管理します',
            icon: 'map',
            href: '/admin/masters/prefectures'
        },
        {
            id: 'weekdays',
            name: '曜日',
            description: '曜日の一覧を管理します',
            icon: 'calendar-days',
            href: '/admin/masters/weekdays'
        }
    ];

    // アイコン表示用の関数
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'calendar':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'microphone':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                );
            case 'film':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                );
            case 'tv':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'map':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                );
            case 'calendar-days':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                );
        }
    };

    if (loading) {
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
                <title>マスタデータ管理 | 佐藤拓也ファンサイト 管理画面</title>
            </Head>
            <div className="py-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">マスタデータ管理</h1>
                    <p className="text-gray-600">サイトで使用する基本データを管理します</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {masterDataList.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-primary"
                        >
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-primary-light flex items-center justify-center text-primary">
                                    {getIcon(item.icon)}
                                </div>
                                <h3 className="ml-3 text-lg font-medium text-gray-900">{item.name}</h3>
                            </div>
                            <p className="text-sm text-gray-500">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}