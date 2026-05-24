import ChatClient from "@/components/chat/ChatClient";

export const metadata = {
  title: "Chat IA — GuiaMX",
  description: "Consulta tus dudas sobre trámites con nuestro asistente virtual.",
};

export default function ChatPage() {
  return (
    <section className="flex flex-1 flex-col">
      <ChatClient />
    </section>
  );
}
