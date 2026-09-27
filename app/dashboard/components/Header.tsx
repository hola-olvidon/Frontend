'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/login');
    };

    return (
        <header className="h-14 sm:h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
                {/* Botón hamburguesa: solo visible en mobile */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Abrir menú"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="text-sm font-medium text-slate-400 truncate">
                    Panel de Control
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Usuario Info */}
                {/* <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold">Administrador</span>
                </div> */}

                {/* Botón Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Cerrar Sesión"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Salir</span>
                </button>
            </div>
        </header>
    );
}
