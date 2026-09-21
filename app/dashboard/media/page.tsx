"use client";

import { useEffect, useState } from "react";
import { mediaApi, AudioItem } from "@/lib/media";
import { Music, Upload, Trash2, Volume2, AlertCircle, Loader2 } from "lucide-react";

export default function MediaPage() {
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // Estado para controlar el estilo visual cuando el usuario arrastra un archivo
    const [isDragging, setIsDragging] = useState(false);

    // 1. Cargar lista de audios
    const loadAudios = async () => {
        try {
            setLoading(true);
            const data = await mediaApi.getAudios();

            // Ordenar los audios alfabéticamente por nombre
            const sortedData = (data || []).sort((a, b) => {
                const nameA = (a.nombre || a.nombreArchivo || "").toLowerCase();
                const nameB = (b.nombre || b.nombreArchivo || "").toLowerCase();
                return nameA.localeCompare(nameB);
            });

            setAudios(sortedData);
        } catch (error) {
            console.error("Error al cargar audios:", error);
            setErrorMsg("No se pudieron cargar los archivos de audio.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAudios();
    }, []);

    // Procesar el archivo seleccionado (vía input o drop)
    const processFile = async (file: File) => {
        setErrorMsg("");

        // Validación: Tipo de archivo
        if (!file.type.startsWith("audio/")) {
            setErrorMsg("Por favor selecciona un archivo de audio válido (MP3, WAV, OGG, etc.).");
            return;
        }

        // Validación: Tamaño máximo (10 MB)
        const MAX_SIZE_MB = 10;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setErrorMsg(`El archivo supera el tamaño máximo permitido de ${MAX_SIZE_MB}MB.`);
            return;
        }

        try {
            setUploading(true);
            await mediaApi.uploadAudio(file);
            await loadAudios(); // Recargar y reordenar la lista
        } catch (error: any) {
            console.error("Error al subir archivo:", error);
            setErrorMsg(error.response?.data?.message || "Ocurrió un error al subir el audio.");
        } finally {
            setUploading(false);
        }
    };

    // Handler para selección normal de archivo
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        e.target.value = ""; // Limpiar input file
    };

    // Eventos para Drag and Drop
    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (uploading) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    // 3. Eliminar audio
    const handleDelete = async (fileKey?: string) => {
        if (!fileKey) return;
        if (!confirm("¿Seguro que deseas eliminar este audio? Se desvinculará de las alarmas asociadas.")) return;

        try {
            await mediaApi.deleteAudio(fileKey);
            setAudios((prev) => prev.filter((item) => (item.nombreArchivo || item.nombre) !== fileKey));
        } catch (error) {
            console.error("Error al eliminar audio:", error);
            alert("Error al eliminar el archivo de audio");
        }
    };

    return (
        <div className="space-y-6 p-6 text-slate-100">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Volume2 className="text-blue-500 w-7 h-7" />
                    Gestión de Audios
                </h1>
                <p className="text-slate-400 text-sm">
                    Sube y gestiona los audios para las alarmas de los tenants.
                </p>
            </div>

            {/* Alerta de error */}
            {errorMsg && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Zona de Carga / Upload Card con Drag and Drop nativo */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <label className="block text-sm font-semibold uppercase text-slate-400 mb-3">
                    Subir Nuevo Audio
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative flex-1 w-full flex items-center justify-center gap-3 border-2 border-dashed p-6 rounded-xl cursor-pointer transition-all group ${isDragging
                                ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                                : "border-slate-700 hover:border-blue-500 bg-slate-950/50 hover:bg-slate-800/50"
                            }`}
                    >
                        <Upload className={`w-6 h-6 transition-colors ${isDragging ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"}`} />
                        <span className="text-sm text-slate-300 font-medium group-hover:text-white">
                            {uploading
                                ? "Procesando archivo..."
                                : isDragging
                                    ? "¡Sueltar el archivo aquí!"
                                    : "Haz clic o arrastra un archivo de audio aquí (MP3, WAV)"}
                        </span>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileInputChange}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>

                    {uploading && (
                        <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Subiendo...</span>
                        </div>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-2">Tamaño máximo: 10MB.</p>
            </div>

            {/* Lista de Audios */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Music className="w-5 h-5 text-blue-400" />
                    Biblioteca de Audios subidos ({audios.length})
                </h2>

                {loading ? (
                    <div className="p-8 text-center text-slate-400 flex justify-center items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        <span>Cargando biblioteca de audio...</span>
                    </div>
                ) : audios.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 italic">
                        No hay audios subidos aún. Sube el primero usando el recuadro superior.
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {audios.map((audio, index) => {
                            const fileName = audio.nombreArchivo || audio.nombre || `audio-${index}`;
                            const displayName = audio.nombre || audio.nombreArchivo || `Audio ${index + 1}`;

                            return (
                                <div
                                    key={fileName}
                                    className="bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-colors shadow-md space-y-3"
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Music className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            <p className="font-semibold text-sm text-white truncate" title={displayName}>
                                                {displayName}
                                            </p>
                                        </div>

                                        <audio
                                            controls
                                            src={audio.urlAudio}
                                            className="w-full h-8 rounded mt-1 accent-blue-500"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2 border-t border-slate-800/80">
                                        <button
                                            onClick={() => handleDelete(fileName)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}