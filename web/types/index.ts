// ─── Auth / Usuario ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
}

// ─── Trámites ─────────────────────────────────────────────────────────────────

export interface Tramite {
  id: string;
  nombre: string;
  descripcion: string;
  monto: number;
  /** Devuelto por GET /tramites como campo directo */
  totalPasos?: number;
  /** Compatibilidad con datos estáticos legacy */
  _count?: { pasos: number };
}

// ─── Pasos ────────────────────────────────────────────────────────────────────

export interface Paso {
  id: string;
  orden: number;
  titulo: string;
  descripcionCorta: string;
  descripcionLarga?: string;
  anteriores: Paso[];
  siguientes: Paso[];
  documentosRequeridos: TipoDocumento[];
}

// ─── Documentos ───────────────────────────────────────────────────────────────

export interface TipoDocumento {
  id: string;
  tipo: string;
  nombre: string;
}

export interface UserDocumento {
  id: string;
  tipoDocumento: TipoDocumento;
  verificado: boolean;
}

/** Resultado del endpoint GET /tramites/:id/compatibilidad */
export interface DocumentoCompatibilidad {
  nombre: string;
  requerido: boolean;
  /** true = el usuario ya tiene este documento en su perfil */
  disponible: boolean;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type RolMensaje = "USER" | "ASSISTANT" | "SYSTEM";

export interface Message {
  id: string;
  rol: RolMensaje;
  contenido: string;
  timestamp: Date;
}

// NextAuth Session augmentation lives in lib/auth.ts to avoid duplicate declarations.

