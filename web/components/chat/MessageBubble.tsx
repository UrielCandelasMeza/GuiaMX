import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

export default function MessageBubble({ role, content, loading }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-brand-600 text-white"
            : "rounded-bl-sm bg-brand-50 text-brand-900",
          loading && "animate-pulse"
        )}
      >
        {content}
      </div>
    </div>
  );
}
