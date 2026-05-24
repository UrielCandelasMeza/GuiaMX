"use client";

import { useState } from "react";
import MessageBubble from "./MessageBubble";
import PromptInput from "./PromptInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente de GuiaMX. ¿En qué trámite te puedo orientar hoy?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // TODO: replace with real API call to /api/chat
    await new Promise((r) => setTimeout(r, 800));
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Entendido. Estoy procesando tu consulta sobre: "${content}". Pronto tendré más información.`,
    };
    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}
          {loading && <MessageBubble role="assistant" content="…" loading />}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <PromptInput onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </div>
  );
}
