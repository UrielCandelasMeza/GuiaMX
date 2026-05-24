import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

/* ── Tipos extendidos ────────────────────────────────────────────────────── */
declare module "next-auth" {
  interface User {
    nombre?: string;
    apellidos?: string;
    token?: string;
  }
  interface Session {
    user: {
      id: string;
      nombre: string;
      apellidos: string;
      correo: string;
      apiToken: string;
    };
  }
  interface JWT {
    apiToken?: string;
    nombre?: string;
    apellidos?: string;
    correo?: string;
  }
}

/* ── Schema de validación ────────────────────────────────────────────────── */
const credentialsSchema = z.object({
  correo: z.string().email(),
  password: z.string().min(1),
});

/* ── Config ──────────────────────────────────────────────────────────────── */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        correo: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log(
            "[AUTH] Validación de schema falló:",
            parsed.error.message,
          );
          return null;
        }

        try {
          console.log("[AUTH] Intentando login con:", parsed.data.correo);
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                correo: parsed.data.correo,
                password: parsed.data.password,
              }),
            },
          );

          console.log("[AUTH] Respuesta del backend:", res.status);

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.log("[AUTH] Error del backend:", errorData);
            return null;
          }

          const data = (await res.json()) as {
            id: string;
            nombre: string;
            apellidos: string;
            correo: string;
            token: string;
          };

          console.log("[AUTH] Login exitoso para:", data.correo);
          return {
            id: data.id,
            nombre: data.nombre,
            apellidos: data.apellidos,
            email: data.correo,
            token: data.token,
          };
        } catch (error) {
          console.error("[AUTH] Error en authorize:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },

  callbacks: {
    /* Agrega datos al JWT en el primer login */
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = token as any;
        t.apiToken = user.token;
        t.nombre = user.nombre;
        t.apellidos = user.apellidos;
        t.correo = user.email ?? "";
      }
      return token;
    },

    /* Expone apiToken, nombre y apellidos en la sesión del cliente */
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = token as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = session as any;
      s.user = {
        id: token.sub ?? "",
        nombre: (t.nombre as string) ?? "",
        apellidos: (t.apellidos as string) ?? "",
        correo: (t.correo as string) ?? "",
        apiToken: (t.apiToken as string) ?? "",
      };
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
