// Modelo de recurrencia de alarmas (espejo de Backend/src/alarms/recurrence.ts).
// `recurrencia == null` ⇒ alarma de una sola vez (usa horaProgramada).

export type RecurrenceTipo =
  | "diaria"
  | "semanal"
  | "mensual"
  | "anual"
  | "intervalo";

export interface RecurrenceBase {
  fechaFin?: string;
}

export interface RecurrenceDiaria extends RecurrenceBase {
  tipo: "diaria";
  hora: string;
}

export interface RecurrenceSemanal extends RecurrenceBase {
  tipo: "semanal";
  diasSemana: number[];
  hora: string;
}

export interface RecurrenceMensual extends RecurrenceBase {
  tipo: "mensual";
  diasMes: number[];
  hora: string;
}

export interface RecurrenceAnual extends RecurrenceBase {
  tipo: "anual";
  fechas: string[];
  hora: string;
}

export interface RecurrenceIntervalo extends RecurrenceBase {
  tipo: "intervalo";
  diasSemana: number[];
  horaInicio: string;
  horaFin: string;
  intervaloMinutos: number;
}

export type Recurrence =
  | RecurrenceDiaria
  | RecurrenceSemanal
  | RecurrenceMensual
  | RecurrenceAnual
  | RecurrenceIntervalo;

/** Días de la semana ISO: 1 = Lunes ... 7 = Domingo. */
export const DIAS_SEMANA: { value: number; label: string; short: string }[] = [
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
  { value: 7, label: "Domingo", short: "Dom" },
];

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatDiasSemana(dias: number[]): string {
  const sorted = [...dias].sort((a, b) => a - b);
  const shorts = sorted.map((d) => DIAS_SEMANA[d - 1].short);

  // Agrupamos rangos consecutivos para un resumen compacto (ej. Lun–Vie).
  const grupos: string[] = [];
  let inicio = 0;
  while (inicio < shorts.length) {
    let fin = inicio;
    while (fin + 1 < shorts.length && sorted[fin + 1] === sorted[fin] + 1) fin++;
    grupos.push(
      fin > inicio
        ? `${shorts[inicio]}–${shorts[fin]}`
        : shorts[inicio],
    );
    inicio = fin + 1;
  }
  return grupos.join(", ");
}

function mesNombre(mmdd: string): string {
  const mes = Number(mmdd.slice(0, 2));
  const dia = Number(mmdd.slice(3, 5));
  return `${dia} ${MESES[mes - 1]}`;
}

/** Resumen legible en español de una regla de recurrencia. */
export function formatRecurrence(r: Recurrence): string {
  switch (r.tipo) {
    case "diaria":
      return `Todos los días ${r.hora}`;
    case "semanal":
      return `${formatDiasSemana(r.diasSemana)} ${r.hora}`;
    case "mensual":
      return `Día ${r.diasMes.join(", ")} de cada mes ${r.hora}`;
    case "anual":
      return `Cada ${r.fechas.map(mesNombre).join(", ")} ${r.hora}`;
    case "intervalo":
      return `Cada ${r.intervaloMinutos} min ${r.horaInicio}–${r.horaFin} ${formatDiasSemana(r.diasSemana)}`;
  }
}

// --- Expansión a instantes concretos (espejo de Backend/src/alarms/recurrence.ts) ---

function parseHora(hora: string): { h: number; m: number } {
  const [h, m] = hora.split(":").map(Number);
  return { h, m };
}

/** Offset (ms) de la zona `timeZone` en el instante `utcMillis` (positivo = zona al este de UTC). */
function offsetMs(timeZone: string, utcMillis: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(utcMillis))) {
    parts[p.type] = p.value;
  }
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - utcMillis;
}

/** Convierte una hora local (wall-clock) en la zona `timeZone` a epoch ms (doble pasada por DST). */
function wallClockToEpochMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const off1 = offsetMs(timeZone, asUtc);
  const off2 = offsetMs(timeZone, asUtc - off1);
  return asUtc - off2;
}

interface CivilDate {
  y: number;
  m: number;
  d: number;
}

/** Fecha civil (año/mes/día) en la zona `timeZone` para un instante dado. */
function civilDate(epochMs: number, timeZone: string): CivilDate {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(epochMs))) {
    parts[p.type] = p.value;
  }
  return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day) };
}

/** Día de la semana ISO (1=Lunes .. 7=Domingo) a partir de una fecha civil. */
function isoDayOfWeek(c: CivilDate): number {
  const utcDay = new Date(Date.UTC(c.y, c.m - 1, c.d)).getUTCDay(); // 0=Dom .. 6=Sáb
  return ((utcDay + 6) % 7) + 1;
}

function addDays(c: CivilDate, n: number): CivilDate {
  const d = new Date(Date.UTC(c.y, c.m - 1, c.d + n));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}

/** Días que tiene el mes `month` (1..12) del año `year`. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Expande una recurrencia a los próximos instantes (epoch ms) posteriores a `fromMs`. */
export function nextOccurrences(
  recurrence: Recurrence,
  fromMs: number,
  timeZone: string,
  maxCount = 20,
): number[] {
  const result: number[] = [];

  const limiteMs = recurrence.fechaFin
    ? wallClockToEpochMs(
        Number(recurrence.fechaFin.slice(0, 4)),
        Number(recurrence.fechaFin.slice(5, 7)),
        Number(recurrence.fechaFin.slice(8, 10)),
        23,
        59,
        timeZone,
      )
    : Number.POSITIVE_INFINITY;

  const push = (ms: number) => {
    if (ms <= fromMs) return;
    if (ms > limiteMs) return;
    if (result.length >= maxCount) return;
    result.push(ms);
  };

  const start = addDays(civilDate(fromMs, timeZone), -1);

  switch (recurrence.tipo) {
    case "diaria": {
      const { h, m } = parseHora(recurrence.hora);
      for (let i = 0; result.length < maxCount && i < 400; i++) {
        const c = addDays(start, i);
        push(wallClockToEpochMs(c.y, c.m, c.d, h, m, timeZone));
      }
      break;
    }
    case "semanal": {
      const { h, m } = parseHora(recurrence.hora);
      const dias = new Set(recurrence.diasSemana);
      for (let i = 0; result.length < maxCount && i < 400; i++) {
        const c = addDays(start, i);
        if (!dias.has(isoDayOfWeek(c))) continue;
        push(wallClockToEpochMs(c.y, c.m, c.d, h, m, timeZone));
      }
      break;
    }
    case "mensual": {
      const { h, m } = parseHora(recurrence.hora);
      const absStart = start.y * 12 + (start.m - 1);
      for (let i = 0; result.length < maxCount && i < 48; i++) {
        const abs = absStart + i;
        const year = Math.floor(abs / 12);
        const month = (abs % 12) + 1;
        const maxDia = daysInMonth(year, month);
        for (const dia of recurrence.diasMes) {
          push(wallClockToEpochMs(year, month, Math.min(dia, maxDia), h, m, timeZone));
        }
      }
      break;
    }
    case "anual": {
      const { h, m } = parseHora(recurrence.hora);
      for (let i = 0; result.length < maxCount && i < 6; i++) {
        const year = start.y + i;
        for (const fecha of recurrence.fechas) {
          const mes = Number(fecha.slice(0, 2));
          const dia = Number(fecha.slice(3, 5));
          if (dia > daysInMonth(year, mes)) continue;
          push(wallClockToEpochMs(year, mes, dia, h, m, timeZone));
        }
      }
      break;
    }
    case "intervalo": {
      const { h: hi, m: mi } = parseHora(recurrence.horaInicio);
      const { h: hf, m: mf } = parseHora(recurrence.horaFin);
      const dias = new Set(recurrence.diasSemana);
      for (let i = 0; result.length < maxCount && i < 400; i++) {
        const c = addDays(start, i);
        if (!dias.has(isoDayOfWeek(c))) continue;
        const inicio = wallClockToEpochMs(c.y, c.m, c.d, hi, mi, timeZone);
        const fin = wallClockToEpochMs(c.y, c.m, c.d, hf, mf, timeZone);
        for (
          let t = inicio;
          t < fin && result.length < maxCount;
          t += recurrence.intervaloMinutos * 60000
        ) {
          push(t);
        }
      }
      break;
    }
  }

  return result.sort((a, b) => a - b).slice(0, maxCount);
}

/** Primera ocurrencia futura de la regla, o `null` si no hay ninguna. */
export function nextOccurrence(
  recurrence: Recurrence,
  fromMs: number,
  timeZone: string,
): number | null {
  return nextOccurrences(recurrence, fromMs, timeZone, 1)[0] ?? null;
}

/** Próximo instante (epoch ms) en que sonará una alarma, o `null` si no tiene más ejecuciones. */
export function nextExecutionMs(
  alarm: { horaProgramada: string | null; recurrencia?: Recurrence | null },
  nowMs: number,
  timeZone: string,
): number | null {
  if (alarm.recurrencia) {
    return nextOccurrence(alarm.recurrencia, nowMs, timeZone);
  }
  if (alarm.horaProgramada) {
    const t = new Date(alarm.horaProgramada).getTime();
    return t > nowMs ? t : null;
  }
  return null;
}
