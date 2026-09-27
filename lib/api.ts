import axios from "axios";
import { logger } from "@/lib/logger";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Para medir la duración de cada request sin tocar el tipo de config
const startTimes = new WeakMap<object, number>();

// Interceptor para peticiones salientes
api.interceptors.request.use((config) => {
  startTimes.set(config, performance.now());

  const method = (config.method ?? "get").toUpperCase();
  logger.debug(`API → ${method} ${config.url}`);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar expiración del token (401) y loguear respuestas
api.interceptors.response.use(
  (response) => {
    const start = startTimes.get(response.config);
    const ms =
      start != null ? Math.round(performance.now() - start) : undefined;
    const method = (response.config.method ?? "get").toUpperCase();
    logger.info(
      `API ← ${method} ${response.config.url} ${response.status}${ms != null ? ` +${ms}ms` : ""}`,
    );
    return response;
  },
  (error) => {
    const config = error.config;
    const start = config ? startTimes.get(config) : undefined;
    const ms =
      start != null ? Math.round(performance.now() - start) : undefined;
    const method = (config?.method ?? "get").toUpperCase();
    const status = error.response?.status ?? "—";
    const message =
      error.response?.data?.message ?? error.message ?? "Error de red";
    logger.error(
      `API ← ${method} ${config?.url} ${status}${ms != null ? ` +${ms}ms` : ""} — ${message}`,
    );

    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
