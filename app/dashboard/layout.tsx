'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
                Cargando panel de administración...
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            {/* Sidebar Lateral Fijo */}
            <Sidebar />

            {/* Área Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}