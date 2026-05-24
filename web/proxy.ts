import { auth } from "@/lib/auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

/** Rutas completamente públicas — no requieren sesión */
const PUBLIC_PATHS = ["/", "/login", "/registro"];

/** Rutas de auth — redirigen a /chat si ya hay sesión */
const AUTH_ONLY_PATHS = ["/login", "/registro"];

export default auth(function proxy(req: NextAuthRequest) {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const path = nextUrl.pathname;

  // API routes → siempre pasar
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Usuario autenticado en login/registro → redirigir a /chat
  if (isLoggedIn && AUTH_ONLY_PATHS.includes(path)) {
    return NextResponse.redirect(new URL("/chat", nextUrl));
  }

  // Ruta pública → dejar pasar siempre
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Ruta protegida sin sesión → redirigir a /login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Aplica el proxy a todas las rutas excepto:
   * - archivos estáticos de Next.js (_next/*)
   * - favicon y assets de imagen
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
