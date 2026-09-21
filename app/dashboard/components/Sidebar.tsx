'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Bell, FileAudio, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    /* { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard }, */
    { name: 'Tenants', href: '/dashboard/tenants', icon: Layers },
    /* { name: 'Alarmas', href: '/dashboard/alarms', icon: Bell }, */
    { name: 'Audios', href: '/dashboard/media', icon: FileAudio },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0">
            {/* Branding / Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-xl text-white tracking-wide">
                <span className="text-blue-500 mr-2">Hola</span> Olvidon
            </div>

            {/* Menú de Navegación */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Version Footer */}
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                Sistema v1.0.0 &bull; 2026
            </div>
        </aside>
    );
}