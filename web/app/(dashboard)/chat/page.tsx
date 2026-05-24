import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatClient from "@/components/chat/ChatClient";

export const metadata = {
  title: "Asistente IA — TrámitesMX",
  description: "Consulta tus dudas sobre trámites con el asistente de inteligencia artificial.",
};

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiToken = (session.user as any).apiToken as string ?? "";

  return (
    <section className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <ChatClient token={apiToken} />
    </section>
  );
}
