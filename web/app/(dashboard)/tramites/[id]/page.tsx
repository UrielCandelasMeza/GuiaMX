import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import type { Paso } from "@/types";
import PasoTimeline from "@/components/tramites/PasoTimeline";
import DocumentosRequeridos from "@/components/tramites/DocumentosRequeridos";
import IniciarTramiteButton from "@/components/tramites/IniciarTramiteButton";
import { Button } from "@/components/ui/button";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:8000";

/* ── Tipos del detalle del trámite (GET /tramites/:id) ───────────────────── */
interface DocPrevio {
  id: string;
  tipo: string;
  nombre: string;
  obligatorio: boolean;
}

interface TramiteDetalle {
  id: string;
  nombre: string;
  descripcion: string;
  monto: number;
  documentosPrevios: DocPrevio[];
  pasos: Paso[];
}

interface ApiDocumento {
  id: string;
  tipo: string;
  nombre: string;
  tieneDocumento: boolean;
}

export interface CompatibilidadDoc {
  nombre: string;
  requerido: boolean;
  disponible: boolean;
}

/* ── Fetchers ────────────────────────────────────────────────────────────── */
async function fetchTramiteDetalle(
  id: string,
  token: string,
): Promise<TramiteDetalle | null> {
  try {
    const res = await fetch(`${API_URL}/tramites/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    console.log(res);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function fetchDocumentosUsuario(token: string): Promise<ApiDocumento[]> {
  try {
    const res = await fetch(`${API_URL}/documentos`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return res.json();
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

/* ── Page ────────────────────────────────────────────────────────────────── */
interface TramiteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TramiteDetailPage({
  params,
}: TramiteDetailPageProps) {
  const { id } = await params;

  console.log(id);

  const session = await auth();
  if (!session) redirect("/login");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = ((session.user as any).apiToken as string) ?? "";

  // Los pasos vienen dentro del mismo GET /tramites/:id — no hay endpoint separado
  const [tramite, documentosUsuario] = await Promise.all([
    fetchTramiteDetalle(id, token),
    fetchDocumentosUsuario(token),
  ]);

  if (!tramite) notFound();

  // Calcular compatibilidad: cruzar documentosPrevios del trámite con los del usuario
  const tiposQueElUsuarioTiene = new Set(
    documentosUsuario.filter((d) => d.tieneDocumento).map((d) => d.tipo),
  );

  const compatibilidad: CompatibilidadDoc[] = tramite.documentosPrevios.map(
    (dp) => ({
      nombre: dp.nombre,
      requerido: dp.obligatorio,
      disponible: tiposQueElUsuarioTiene.has(dp.tipo),
    }),
  );

  const puedeIniciar = compatibilidad
    .filter((d) => d.requerido)
    .every((d) => d.disponible);

  const pasos: Paso[] = tramite.pasos ?? [];

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
          <h1 className="text-2xl font-bold text-brand-900">
            {tramite.nombre}
          </h1>
          <PrecioBadge monto={tramite.monto ?? 0} />
        </div>
        <p className="max-w-2xl text-[15px] text-secondary">
          {tramite.descripcion}
        </p>
      </div>

      {/* Dos columnas */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Principal — timeline de pasos */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-brand-800">
            Pasos del trámite
          </h2>
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

        {/* Lateral — documentos requeridos + acciones */}
        <div className="flex flex-col gap-4">
          {/* Panel de documentos requeridos con compatibilidad real */}
          <DocumentosRequeridos compatibilidad={compatibilidad} />

          {/* Botón iniciar trámite — client component, llama a POST /tramites/:id/iniciar */}
          <IniciarTramiteButton
            tramiteId={id}
            token={token}
            habilitado={puedeIniciar}
          />

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
