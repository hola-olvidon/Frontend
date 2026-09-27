'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, FileAudio, Settings, X } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    /* { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard }, */
    { name: 'Tenants', href: '/dashboard/tenants', icon: Layers },
    /* { name: 'Alarmas', href: '/dashboard/alarms', icon: Bell }, */
    { name: 'Audios', href: '/dashboard/media', icon: FileAudio },
    { name: 'Configuración', href: '/dashboard/config', icon: Settings },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Fondo oscuro cuando el menú está abierto en mobile */}
            <div
                onClick={onClose}
                className={clsx(
                    'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300',
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
            />

            <aside
                className={clsx(
                    'fixed left-0 top-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out',
                    'lg:sticky lg:translate-x-0 lg:z-auto',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Branding / Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 font-bold text-xl text-white tracking-wide">
                    <span className="truncate">
                        <span className="text-blue-500 mr-2">Hola</span> Olvidon
                    </span>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors"
                        title="Cerrar menú"
                        aria-label="Cerrar menú"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menú de Navegación */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
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
        </>
    );
}
