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
