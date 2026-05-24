import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Tramite } from "@/types";
import TramitesGrid from "@/components/tramites/TramitesGrid";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

/* ── Fetcher ─────────────────────────────────────────────────────────────── */
async function fetchTramites(token: string): Promise<Tramite[]> {
  try {
    const res = await fetch(`${API_URL}/tramites`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 }, // revalida cada minuto
    });
    if (!res.ok) {
      console.error("[TRAMITES] API respondió", res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[TRAMITES] Error al obtener trámites:", err);
    return [];
  }
}

/* ── Metadata ────────────────────────────────────────────────────────────── */
export const metadata = {
  title: "Trámites — GuíasMX",
  description: "Explora todos los trámites gubernamentales disponibles.",
};

/* ── Page ────────────────────────────────────────────────────────────────── */
export default async function TramitesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = (session.user as any).apiToken as string ?? "";
  const tramites = await fetchTramites(token);

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-brand-900">
          Trámites disponibles
        </h1>
        {tramites.length === 0 && (
          <p className="mt-1 text-sm text-amber-600">
            No se pudieron cargar los trámites. Verifica que el servidor esté activo.
          </p>
        )}
      </div>

      {/* ── Contenido con búsqueda (client component) ── */}
      <div className="flex flex-col gap-4 p-8">
        <TramitesGrid tramites={tramites} />
      </div>
    </div>
  );
}
