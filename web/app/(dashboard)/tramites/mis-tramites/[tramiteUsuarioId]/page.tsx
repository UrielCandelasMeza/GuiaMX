import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronRight, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import SeguimientoPasos, {
  type PasoInteractivo,
} from "@/components/tramites/SeguimientoPasos";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

/* ── Tipos ───────────────────────────────────────────────────────────────── */
type EstadoTramite = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO";

interface TramiteUsuarioDetalle {
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
  pasos: PasoInteractivo[];
}

/* ── Fetcher ─────────────────────────────────────────────────────────────── */
async function fetchSeguimiento(
  tramiteUsuarioId: string,
  token: string,
): Promise<TramiteUsuarioDetalle | null> {
  try {
    const res = await fetch(`${API_URL}/tramites/mis-tramites`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const todos = (await res.json()) as TramiteUsuarioDetalle[];
    return todos.find((t) => t.id === tramiteUsuarioId) ?? null;
  } catch {
    return null;
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
    <span className={cn("inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
interface PageProps {
  params: Promise<{ tramiteUsuarioId: string }>;
}

export default async function SeguimientoPage({ params }: PageProps) {
  const { tramiteUsuarioId } = await params;

  const session = await auth();
  if (!session) redirect("/login");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session.user as any).apiToken as string ?? "";

  const tu = await fetchSeguimiento(tramiteUsuarioId, token);
  if (!tu) notFound();

  const completados = tu.pasos.filter(
    (p) => p.estado === "COMPLETADO" || p.estado === "OMITIDO",
  ).length;
  const total = tu.pasos.length;
  const progreso = total > 0 ? Math.round((completados / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 flex-wrap text-sm text-slate-500">
        <Link href="/tramites" className="no-underline hover:text-brand-600 transition-colors">
          Trámites
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/tramites/mis-tramites" className="no-underline hover:text-brand-600 transition-colors">
          Mis trámites
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-slate-700 truncate max-w-[200px]">
          {tu.tramite.nombre}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6 rounded-md border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-brand-900">{tu.tramite.nombre}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Iniciado el{" "}
              {new Date(tu.iniciadoEn).toLocaleDateString("es-MX", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            {tu.completadoEn && (
              <p className="mt-0.5 text-sm text-green-600 font-medium">
                Completado el{" "}
                {new Date(tu.completadoEn).toLocaleDateString("es-MX", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            )}
          </div>
          <EstadoBadge estado={tu.estado} />
        </div>

        {/* Barra de progreso */}
        {total > 0 && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-slate-500">
                <ListChecks className="h-4 w-4" />
                {completados} de {total} pasos completados
              </span>
              <span className="font-semibold text-brand-600">{progreso}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progreso === 100 ? "bg-green-500" : "bg-brand-600",
                )}
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        )}

        {/* Completado banner */}
        {tu.estado === "COMPLETADO" && (
          <div className="mt-4 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            ¡Trámite completado exitosamente!
          </div>
        )}

        {/* En progreso info */}
        {tu.estado === "EN_PROGRESO" && (
          <div className="mt-4 flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
            <Clock className="h-4 w-4 shrink-0" />
            Marca cada paso como completado conforme avances en tu trámite.
          </div>
        )}
      </div>

      {/* Pasos interactivos */}
      <div className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-base font-semibold text-brand-900">
          Pasos del trámite
        </h2>
        <SeguimientoPasos
          tramiteUsuarioId={tu.id}
          token={token}
          pasosIniciales={tu.pasos}
        />
      </div>

      {/* Acciones inferiores */}
      <div className="mt-4 flex justify-between items-center">
        <Link
          href="/tramites/mis-tramites"
          className="text-sm text-slate-500 hover:text-slate-700 no-underline transition-colors"
        >
          ← Volver a mis trámites
        </Link>
        <Link
          href={`/tramites/${tu.tramite.id}`}
          className="text-sm text-brand-600 hover:text-brand-800 no-underline transition-colors"
        >
          Ver detalle del trámite →
        </Link>
      </div>
    </div>
  );
}
