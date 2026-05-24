// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  nombre: string;
  email: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

// ─── Trámites ─────────────────────────────────────────────────────────────────

export type TramiteEstado =
  | "pendiente"
  | "en_proceso"
  | "completado"
  | "requiere_atencion";

export interface Tramite {
  id: string;
  titulo: string;
  descripcion: string;
  estado: TramiteEstado;
  pasos: Paso[];
  documentos: Documento[];
  createdAt: string;
  updatedAt: string;
}

// ─── Pasos ────────────────────────────────────────────────────────────────────

export interface Paso {
  id: string;
  numero: number;
  titulo: string;
  descripcion?: string;
  completado: boolean;
  tramiteId: string;
}

// ─── Documentos ───────────────────────────────────────────────────────────────

export interface Documento {
  id: string;
  nombre: string;
  requerido: boolean;
  url?: string;
  tramiteId: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
