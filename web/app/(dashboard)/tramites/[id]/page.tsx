import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Tramite, Paso, DocumentoCompatibilidad } from "@/types";
import { Button } from "@/components/ui/button";
import PasoTimeline from "@/components/tramites/PasoTimeline";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Fetchers ────────────────────────────────────────────────────────────── */
async function fetchTramite(id: string, token: string): Promise<Tramite | null> {
  try {
    const res = await fetch(`${API_URL}/tramites/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchPasos(id: string, token: string): Promise<Paso[]> {
  try {
    const res = await fetch(`${API_URL}/tramites/${id}/pasos`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch {
    return [];
  }
}

async function fetchCompatibilidad(
  id: string,
  token: string
): Promise<DocumentoCompatibilidad[]> {
  try {
    const res = await fetch(`${API_URL}/tramites/${id}/compatibilidad`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch {
    return [];
  }
}

/* ── PrecioBadge ─────────────────────────────────────────────────────────── */
function PrecioBadge({ monto }: { monto: number }) {
  if (monto === 0)
    return (
      <span className="inline-flex items-center rounded border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800">
        Gratuito
      </span>
    );
  return (
    <span className="inline-flex items-center rounded border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800">
      ${monto.toLocaleString("es-MX")} MXN
    </span>
  );
}

/* ── DocumentosPanel ─────────────────────────────────────────────────────── */
function DocumentosPanel({
  documentos,
}: {
  documentos: DocumentoCompatibilidad[];
  tramiteId: string;
}) {
  const obligatorios = documentos.filter((d) => d.requerido);
  const tienesTodos  = obligatorios.every((d) => d.disponible);

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-brand-900">
          Documentos necesarios
        </h3>
      </div>

      {documentos.length === 0 ? (
        <p className="text-xs text-secondary">
          Información de documentos no disponible.
        </p>
      ) : (
        <ul className="mb-5 flex flex-col gap-2.5">
          {documentos.map((doc) => (
            <li key={doc.nombre} className="flex items-center gap-2.5">
              {doc.disponible ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <span
                className={cn(
                  "text-sm",
                  doc.disponible ? "text-slate-700" : "text-slate-400",
                  doc.requerido && !doc.disponible && "font-medium"
                )}
              >
                {doc.nombre}
                {doc.requerido && (
                  <span className="ml-1 text-xs text-red-400">*</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {tienesTodos ? (
        <Button id="btn-iniciar-tramite" className="w-full">
          Iniciar trámite
        </Button>
      ) : (
        <button
          disabled
          className="w-full cursor-not-allowed rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
        >
          Documentos incompletos
        </button>
      )}

      {obligatorios.length > 0 && (
        <p className="mt-3 text-xs text-placeholder">* Documento obligatorio</p>
      )}
    </aside>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
interface TramiteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TramiteDetailPage({
  params,
}: TramiteDetailPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session) redirect("/login");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session.user as any).apiToken as string ?? "";

  const [tramite, pasos, compatibilidad] = await Promise.all([
    fetchTramite(id, token),
    fetchPasos(id, token),
    fetchCompatibilidad(id, token),
  ]);

  if (!tramite) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/tramites"
          className="no-underline transition-colors hover:text-brand-600"
        >
          Trámites
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">{tramite.nombre}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-brand-900">{tramite.nombre}</h1>
          <PrecioBadge monto={tramite.monto ?? 0} />
        </div>
        <p className="max-w-2xl text-[15px] text-secondary">
          {tramite.descripcion}
        </p>
      </div>

      {/* Dos columnas */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Principal — timeline */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-brand-800">
            Pasos del trámite
          </h2>
          {/* Determina el primer paso no completado como el actual */}
          <PasoTimeline
            pasos={pasos}
            pasoActualIdx={
              pasos.findIndex((p: Paso) => p.anteriores?.length === 0) ?? 0
            }
          />
          {pasos.length === 0 && (
            <p className="text-sm text-secondary">
              No hay pasos registrados para este trámite.
            </p>
          )}
        </div>

        {/* Lateral — documentos */}
        <div className="flex flex-col gap-4">
          <DocumentosPanel documentos={compatibilidad} tramiteId={id} />

          <Link href={`/chat?tramite=${id}`} className="no-underline">
            <Button
              id="btn-consultar-asistente"
              variant="outline"
              className="w-full"
            >
              Consultar con el asistente
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
