"use client";

import { useState, KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function PromptInput({ onSend, disabled }: PromptInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-xl border border-input bg-background px-4 py-2 focus-within:ring-2 focus-within:ring-brand-600">
      <textarea
        id="chat-input"
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          "max-h-40 min-h-[2rem] py-1"
        )}
        placeholder="Escribe tu consulta… (Enter para enviar)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        id="chat-send-btn"
        aria-label="Enviar mensaje"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="mb-0.5 flex-shrink-0 rounded-lg bg-brand-600 p-2 text-white transition-colors hover:bg-brand-800 disabled:opacity-40"
      >
        <SendHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
