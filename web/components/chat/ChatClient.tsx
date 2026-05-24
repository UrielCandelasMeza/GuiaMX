"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  KeyboardEvent,
} from "react";
import { Bot, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebSocket, type Message } from "@/hooks/useWebSocket";
import DocumentosPanel from "@/components/chat/DocumentosPanel";

/* ── Chips de ejemplo ────────────────────────────────────────────────────── */
const EXAMPLE_PROMPTS = [
  "¿Qué documentos necesito para tramitar el RFC?",
  "¿Cómo obtengo mi CURP?",
  "¿Cuánto cuesta el trámite de pasaporte?",
] as const;

/* ── Indicador de conexión ───────────────────────────────────────────────── */
function ConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium",
        connected
          ? "bg-green-50 text-green-700"
          : "bg-slate-100 text-slate-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? "bg-green-500" : "bg-slate-400"
        )}
      />
      {connected ? "Conectado" : "Desconectado"}
    </span>
  );
}

/* ── Loading dots ────────────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <div className="flex items-end gap-1 px-4 py-3">
      <div
        className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

/* ── Burbuja de mensaje ──────────────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.rol === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar asistente */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 text-[15px] leading-relaxed",
          isUser
            ? "rounded-br-none bg-brand-600 text-white"
            : "rounded-bl-none border border-slate-200 bg-white text-body"
        )}
      >
        {/* Preservar saltos de línea en respuestas del asistente */}
        {msg.contenido.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < msg.contenido.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Estado vacío ────────────────────────────────────────────────────────── */
function EmptyState({ onChip }: { onChip: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <Bot className="h-14 w-14 text-brand-100" strokeWidth={1.25} />
      <div>
        <p className="text-xl font-semibold text-slate-700">
          Hola, soy tu asistente de trámites
        </p>
        <p className="mt-1.5 text-sm text-slate-500">
          Pregúntame sobre cualquier trámite gubernamental en México. Estoy aquí
          para orientarte.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onChip(prompt)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors hover:border-brand-600 hover:text-brand-600"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* DocumentosPanel importado desde @/components/chat/DocumentosPanel */

/* ── ChatClient ──────────────────────────────────────────────────────────── */
export default function ChatClient({ token }: { token: string }) {
  const { isConnected, isLoading, messages, sendMessage } = useWebSocket({ token });

  const [draft, setDraft]     = useState("");
  const bottomRef             = useRef<HTMLDivElement>(null);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll al último mensaje */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* Ajuste dinámico de altura del textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // Máximo 4 líneas ≈ 96px
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [draft]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [draft, isLoading, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChip = (text: string) => {
    setDraft(text);
    textareaRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">

      {/* ── a) HEADER ── */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-brand-900">
            Asistente de Trámites
          </h1>
          <ConnectionBadge connected={isConnected} />
        </div>
        <DocumentosPanel token={token} />
      </div>

      {/* ── b) ÁREA DE MENSAJES ── */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-slate-50 px-4 py-6 md:px-8">
        {isEmpty ? (
          <EmptyState onChip={handleChip} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Loading dots del asistente */}
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[75%] rounded-lg rounded-bl-none border border-slate-200 bg-white">
                  <LoadingDots />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── c) INPUT ── */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 focus-within:border-brand-600 transition-colors">
            <textarea
              id="chat-textarea"
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Escribe tu consulta sobre trámites..."
              className="flex-1 resize-none bg-transparent text-sm text-body outline-none placeholder:text-placeholder disabled:opacity-50"
              style={{ maxHeight: "96px" }}
            />
            <button
              id="chat-send-btn"
              aria-label="Enviar mensaje"
              onClick={handleSend}
              disabled={isLoading || !draft.trim()}
              className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-600 text-white transition-colors hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-xs text-placeholder">
            Enter para enviar · Shift + Enter para salto de línea
          </p>
        </div>
      </div>
    </div>
  );
}
