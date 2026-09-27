// Logger liviano con niveles, controlado por NEXT_PUBLIC_LOG_LEVEL.
// La variable se inline en build (como NEXT_PUBLIC_API_URL), así que para
// cambiarla en producción hay que rebuildear la imagen.

export type LogLevel = "debug" | "info" | "none";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  none: 2,
};

function parseLevel(value: string | undefined): LogLevel {
  switch (value) {
    case "debug":
      return "debug";
    case "none":
      return "none";
    case "info":
    default:
      return "info";
  }
}

const configured = parseLevel(process.env.NEXT_PUBLIC_LOG_LEVEL);

function enabled(minLevel: "debug" | "info"): boolean {
  return LEVEL_ORDER[configured] <= LEVEL_ORDER[minLevel];
}

function fmt(args: unknown[]): unknown[] {
  return args.length === 0 ? [""] : args;
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (enabled("debug")) console.log(...fmt(args));
  },
  info: (...args: unknown[]) => {
    if (enabled("info")) console.info(...fmt(args));
  },
  warn: (...args: unknown[]) => {
    if (enabled("info")) console.warn(...fmt(args));
  },
  error: (...args: unknown[]) => {
    if (enabled("info")) console.error(...fmt(args));
  },
};
