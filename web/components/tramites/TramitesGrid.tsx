"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Tramite } from "@/types";
import TramiteCard from "@/components/tramites/TramiteCard";

interface TramitesGridProps {
  tramites: Tramite[];
}

export default function TramitesGrid({ tramites }: TramitesGridProps) {
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tramites;
    return tramites.filter(
      (t) =>
        t.nombre.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q),
    );
  }, [tramites, query]);

  return (
    <>
      {/* Barra de búsqueda */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" />
        <input
          id="tramites-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar trámite..."
          className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-body placeholder:text-placeholder outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-colors"
        />
      </div>

      {/* Contador dinámico */}
      <p className="mt-1 text-sm text-slate-500">
        {filtrados.length} de {tramites.length} trámites
        {query && ` · "${query}"`}
      </p>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="col-span-full flex flex-col items-center gap-2 py-16 text-center">
          <Search className="h-10 w-10 text-slate-200" strokeWidth={1.5} />
          <p className="text-slate-500">
            No se encontraron trámites para{" "}
            <span className="font-medium">"{query}"</span>
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-1 text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((tramite) => (
            <TramiteCard key={tramite.id} tramite={tramite} />
          ))}
        </div>
      )}
    </>
  );
}
