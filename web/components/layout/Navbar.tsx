"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Scale,
  MessageCircle,
  FileText,
  Menu,
  LogOut,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ── Nav links config ────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "/chat",     label: "Chat",         icon: MessageCircle },
  { href: "/tramites", label: "Mis Trámites", icon: FileText },
] as const;

/* ── Iniciales del usuario ───────────────────────────────────────────────── */
function getInitials(nombre: string, apellidos: string): string {
  const n = nombre?.trim()[0]?.toUpperCase() ?? "";
  const a = apellidos?.trim()[0]?.toUpperCase() ?? "";
  return `${n}${a}` || "?";
}

/* ── NavLink ─────────────────────────────────────────────────────────────── */
function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  pathname: string;
  onClick?: () => void;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 py-1 text-sm font-medium transition-colors",
        active
          ? "border-b-2 border-white text-white"
          : "text-blue-200 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

/* ── UserAvatar + Dropdown ───────────────────────────────────────────────── */
function UserMenu() {
  const { data: session } = useSession();
  const nombre    = (session?.user as { nombre?: string })?.nombre    ?? "";
  const apellidos = (session?.user as { apellidos?: string })?.apellidos ?? "";
  const correo    = (session?.user as { correo?: string })?.correo    ?? "";
  const fullName  = [nombre, apellidos].filter(Boolean).join(" ") || "Usuario";
  const initials  = getInitials(nombre, apellidos);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id="user-menu-trigger"
        aria-label="Menú de usuario"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        {initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* Nombre + correo — no clicables */}
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-body">{fullName}</p>
          <p className="truncate text-xs text-placeholder">{correo}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Cerrar sesión */}
        <DropdownMenuItem
          id="signout-btn"
          className="cursor-pointer gap-2 text-slate-700 focus:bg-slate-100 focus:text-slate-700"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Navbar ──────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-brand-900 text-white">
      <div className="flex h-full items-center justify-between px-6">

        {/* ── Logo ── */}
        <Link
          href="/chat"
          className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
        >
          <Scale className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-base font-semibold tracking-tight">TrámitesMX</span>
        </Link>

        {/* ── Nav links — desktop only ── */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} pathname={pathname} {...link} />
          ))}
        </nav>

        {/* ── Derecha: user menu + mobile toggle ── */}
        <div className="flex items-center gap-3">
          <UserMenu />

          {/* Mobile Sheet trigger */}
          <Sheet>
            <SheetTrigger
              id="mobile-menu-trigger"
              aria-label="Abrir menú de navegación"
              className="flex items-center justify-center rounded-md p-1.5 text-blue-200 hover:bg-brand-800 hover:text-white transition-colors md:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-72 bg-brand-900 text-white border-brand-800 p-0">
              <SheetHeader className="px-6 pt-6 pb-4">
                <SheetTitle className="flex items-center gap-2 text-white">
                  <Scale className="h-5 w-5" strokeWidth={1.75} />
                  TrámitesMX
                </SheetTitle>
              </SheetHeader>

              <Separator className="bg-brand-800" />

              <nav className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    pathname={pathname}
                    {...link}
                    // Close sheet via the SheetClose pattern isn't available here;
                    // navigation itself closes the sheet on route change
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
