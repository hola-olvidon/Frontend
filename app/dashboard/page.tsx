export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Bienvenido al Panel de Control</h1>
                <p className="text-slate-400 text-sm">
                    Gestiona las empresas (Tenants), la programación de alarmas y los archivos de audio en MinIO.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium">Módulo Tenants</h3>
                    <p className="text-2xl font-bold mt-2 text-white">Gestión Global</p>
                    <span className="text-xs text-slate-500 mt-1 block">Creación y configuración de clientes.</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium">Módulo Alarmas</h3>
                    <p className="text-2xl font-bold mt-2 text-white">Programación ISO</p>
                    <span className="text-xs text-slate-500 mt-1 block">Asignación de tonos y horarios.</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-slate-400 text-sm font-medium">Almacenamiento S3</h3>
                    <p className="text-2xl font-bold mt-2 text-white">MinIO Media</p>
                    <span className="text-xs text-slate-500 mt-1 block">Subida y preescucha de audios.</span>
                </div>
            </div>
        </div>
    );
}