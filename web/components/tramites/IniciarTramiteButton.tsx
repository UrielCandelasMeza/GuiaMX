"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface IniciarTramiteButtonProps {
  tramiteId: string;
  token: string;
  /** true cuando el usuario tiene todos los documentos obligatorios */
  habilitado: boolean;
}

export default function IniciarTramiteButton({
  tramiteId,
  token,
  habilitado,
}: IniciarTramiteButtonProps) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  const handleIniciar = async () => {
    if (!habilitado || cargando) return;
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/tramites/${tramiteId}/iniciar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 409) {
        // Ya estaba iniciado — redirigir a "Mis trámites"
        toast.info("Ya tienes este trámite en curso. Te redirigimos a tu seguimiento.");
        router.push("/tramites/mis-tramites");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "No se pudo iniciar el trámite. Intenta de nuevo.");
        return;
      }

      const data = await res.json() as { tramiteUsuarioId: string };
      toast.success("¡Trámite iniciado exitosamente!");
      // Redirigir al seguimiento del trámite iniciado
      router.push(`/tramites/mis-tramites/${data.tramiteUsuarioId}`);
    } catch {
      toast.error("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  if (!habilitado) {
    return (
      <button
        id="btn-iniciar-tramite-disabled"
        disabled
        className="w-full cursor-not-allowed rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
        title="Necesitas todos los documentos obligatorios para iniciar este trámite"
      >
        Documentos incompletos
      </button>
    );
  }

  return (
    <button
      id="btn-iniciar-tramite"
      onClick={handleIniciar}
      disabled={cargando}
      className="inline-flex w-full items-center justify-center gap-2 rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
      {cargando ? "Iniciando..." : "Iniciar trámite"}
    </button>
  );
}
