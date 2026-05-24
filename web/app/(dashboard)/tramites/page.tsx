import { Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Tramite } from "@/types";
import TramiteCard from "@/components/tramites/TramiteCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchTramites(token: string): Promise<Tramite[]> {
  try {
    const res = await fetch(`${API_URL}/tramites`, {
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

/* ── Fallback para development / sin API ─────────────────────────────────── */
const FALLBACK_TRAMITES: Tramite[] = [
  {
    id: "rfc-alta",
    nombre: "Alta en el RFC",
    descripcion:
      "Inscripción al Registro Federal de Contribuyentes ante el SAT para personas físicas y morales.",
    monto: 0,
    _count: { pasos: 4 },
  },
  {
    id: "curp",
    nombre: "Obtención de CURP",
    descripcion:
      "Clave Única de Registro de Población. Documento de identidad oficial para todos los ciudadanos mexicanos.",
    monto: 0,
    _count: { pasos: 2 },
  },
  {
    id: "pasaporte",
    nombre: "Trámite de Pasaporte",
    descripcion:
      "Expedición o renovación de pasaporte mexicano en la Secretaría de Relaciones Exteriores.",
    monto: 1575,
    _count: { pasos: 5 },
  },
  {
    id: "ine",
    nombre: "Credencial de Elector (INE)",
    descripcion:
      "Tramitar o renovar la credencial para votar ante el Instituto Nacional Electoral.",
    monto: 0,
    _count: { pasos: 3 },
  },
  {
    id: "efirma",
    nombre: "EFirma (Firma Electrónica)",
    descripcion:
      "Obtención de la firma electrónica avanzada del SAT para realizar trámites fiscales en línea.",
    monto: 0,
    _count: { pasos: 3 },
  },
  {
    id: "licencia",
    nombre: "Licencia de Conducir",
    descripcion:
      "Trámite de licencia vehicular de manejo ante la autoridad de transporte del estado.",
    monto: 450,
    _count: { pasos: 4 },
  },
];

export const metadata = {
  title: "Trámites — TrámitesMX",
  description: "Explora todos los trámites gubernamentales disponibles.",
};

export default async function TramitesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session.user as any).apiToken as string ?? "";
  const tramites = await fetchTramites(token);
  const list = tramites.length > 0 ? tramites : FALLBACK_TRAMITES;

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">
              Trámites disponibles
            </h1>
            <p className="mt-1 text-sm text-secondary">
              {list.length} trámites · Selecciona uno para ver el detalle paso a paso
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" />
            <input
              id="tramites-search"
              type="search"
              placeholder="Buscar trámite..."
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-body placeholder:text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-2 lg:grid-cols-3">
        {list.map((tramite) => (
          <TramiteCard key={tramite.id} tramite={tramite} />
        ))}
      </div>
    </div>
  );
}
