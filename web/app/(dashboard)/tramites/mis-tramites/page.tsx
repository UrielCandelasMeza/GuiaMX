import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, ListChecks, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

/* ── Tipos ───────────────────────────────────────────────────────────────── */
type EstadoTramite = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO";
type EstadoPaso = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "OMITIDO";

interface PasoSeguimiento {
  pasoId: string;
  orden: number;
  titulo: string;
  descripcionCorta: string;
  estado: EstadoPaso;
  completadoEn: string | null;
}

interface TramiteUsuario {
  id: string;
  estado: EstadoTramite;
  iniciadoEn: string;
  completadoEn: string | null;
  tramite: {
    id: string;
    nombre: string;
    descripcion: string;
    monto: number;
  };
  pasos: PasoSeguimiento[];
}

/* ── Fetcher ─────────────────────────────────────────────────────────────── */
async function fetchMisTramites(token: string): Promise<TramiteUsuario[]> {
  try {
    const res = await fetch(`${API_URL}/tramites/mis-tramites`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // siempre fresco para mostrar el estado real
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/* ── EstadoBadge ─────────────────────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: EstadoTramite }) {
  const cfg = {
    PENDIENTE:   { label: "Pendiente",   cls: "bg-slate-100 text-slate-600" },
    EN_PROGRESO: { label: "En progreso", cls: "bg-blue-50 text-blue-700" },
    COMPLETADO:  { label: "Completado",  cls: "bg-green-50 text-green-700" },
    CANCELADO:   { label: "Cancelado",   cls: "bg-red-50 text-red-600" },
  } as const;
  const { label, cls } = cfg[estado] ?? cfg.PENDIENTE;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {label}
    </span>
  );
}

/* ── PasoRow ─────────────────────────────────────────────────────────────── */
function PasoRow({ paso }: { paso: PasoSeguimiento }) {
  const icono = {
    COMPLETADO:  <CheckCircle2 className="h-4 w-4 text-green-600" />,
    EN_PROGRESO: <Clock className="h-4 w-4 text-blue-500" />,
    OMITIDO:     <span className="h-4 w-4 text-slate-300 text-xs font-bold flex items-center">⏭</span>,
    PENDIENTE:   <span className="h-4 w-4 rounded-full border-2 border-slate-200 inline-block" />,
  }[paso.estado];

  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 shrink-0">{icono}</span>
      <span
        className={cn(
          paso.estado === "COMPLETADO" ? "text-slate-700" : "text-slate-400",
          paso.estado === "EN_PROGRESO" && "text-slate-700 font-medium",
        )}
      >
        {paso.orden}. {paso.titulo}
      </span>
    </li>
  );
}

/* ── TramiteUsuarioCard ──────────────────────────────────────────────────── */
function TramiteUsuarioCard({ tu }: { tu: TramiteUsuario }) {
  const completados = tu.pasos.filter(
    (p) => p.estado === "COMPLETADO" || p.estado === "OMITIDO",
  ).length;
  const total = tu.pasos.length;
  const progreso = total > 0 ? Math.round((completados / total) * 100) : 0;

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900 leading-snug">
            {tu.tramite.nombre}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Iniciado el{" "}
            {new Date(tu.iniciadoEn).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <EstadoBadge estado={tu.estado} />
      </div>

      {/* Barra de progreso */}
      {total > 0 && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              {completados}/{total} pasos
            </span>
            <span>{progreso}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      )}

      {/* Pasos (máximo 4, resto colapsado) */}
      <ul className="flex flex-col gap-1.5 mb-4">
        {tu.pasos.slice(0, 4).map((paso) => (
          <PasoRow key={paso.pasoId} paso={paso} />
        ))}
        {tu.pasos.length > 4 && (
          <li className="text-xs text-slate-400 pl-6">
            +{tu.pasos.length - 4} pasos más
          </li>
        )}
      </ul>

      {/* Links de acción */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href={`/tramites/mis-tramites/${tu.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 no-underline transition-colors"
        >
          Ver seguimiento
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/tramites/${tu.tramite.id}`}
          className="text-xs text-slate-400 hover:text-slate-600 no-underline transition-colors"
        >
          Detalle del trámite
        </Link>
      </div>
    </article>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export const metadata = {
  title: "Mis trámites — TrámitesMX",
  description: "Seguimiento de tus trámites gubernamentales en curso.",
};

export default async function MisTramitesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session.user as any).apiToken as string ?? "";
  const misTramites = await fetchMisTramites(token);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-brand-900">Mis trámites</h1>
        <p className="mt-1 text-sm text-slate-500">
          {misTramites.length > 0
            ? `${misTramites.length} trámite${misTramites.length !== 1 ? "s" : ""} en seguimiento`
            : "Aún no has iniciado ningún trámite"}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-8">
        {misTramites.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <ListChecks className="h-12 w-12 text-slate-200" strokeWidth={1.5} />
            <p className="text-slate-500">
              No has iniciado ningún trámite todavía.
            </p>
            <Link
              href="/tramites"
              className="inline-flex items-center gap-1.5 rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-brand-800 transition-colors"
            >
              Explorar trámites disponibles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {misTramites.map((tu) => (
              <TramiteUsuarioCard key={tu.id} tu={tu} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
