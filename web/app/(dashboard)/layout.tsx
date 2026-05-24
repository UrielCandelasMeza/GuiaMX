import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NextAuth v5: obtiene sesión en el servidor
  const session = await auth();

  // Sin sesión → redirige a login
  if (!session) {
    redirect("/login");
  }

  return (
    /*
     * SessionProvider expone la sesión a los Client Components hijos.
     * Navbar usa useSession() para mostrar nombre e iniciales del usuario.
     * Pasamos `session` para evitar un fetch redundante al cliente.
     */
    <SessionProvider session={session}>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        {children}
      </main>
    </SessionProvider>
  );
}
