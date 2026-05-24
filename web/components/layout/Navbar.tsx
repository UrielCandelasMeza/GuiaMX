"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Scale,
  MessageCircle,
  FileText,
  ClipboardList,
  Menu,
  LogOut,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
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

const NAV_LINKS = [
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/tramites", label: "Trámites", icon: FileText },
  { href: "/tramites/mis-tramites", label: "Mis trámites", icon: ClipboardList },
] as const;

function getInitials(nombre: string, apellidos: string): string {
  const n = nombre?.trim()[0]?.toUpperCase() ?? "";
  const a = apellidos?.trim()[0]?.toUpperCase() ?? "";
  return `${n}${a}` || "?";
}

function NavLink({
  href,
  label,
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
        "py-1 text-sm font-medium transition-colors no-underline",
        active
          ? "text-[#0A0A0A] underline underline-offset-4 decoration-[#0A0A0A]"
          : "text-[#737373] hover:text-[#0A0A0A]"
      )}
    >
      {label}
    </Link>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const nombre = (session?.user as { nombre?: string })?.nombre ?? "";
  const apellidos = (session?.user as { apellidos?: string })?.apellidos ?? "";
  const correo = (session?.user as { correo?: string })?.correo ?? "";
  const fullName = [nombre, apellidos].filter(Boolean).join(" ") || "Usuario";
  const initials = getInitials(nombre, apellidos);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id="user-menu-trigger"
        aria-label="Menú de usuario"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-sm font-semibold text-white transition-opacity hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]/30"
      >
        {initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 shadow-stripe-md border-[#E5E7EB]">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-[#0A0A0A]">{fullName}</p>
          <p className="truncate text-xs text-[#A3A3A3]">{correo}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          id="signout-btn"
          className="cursor-pointer gap-2 text-[#737373] focus:bg-[#F3F4F6] focus:text-[#0A0A0A]"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 h-14 w-full bg-white border-b border-[#E5E7EB]">
      <div className="flex h-full items-center justify-between px-6 max-w-7xl mx-auto">

        <Link
          href="/chat"
          className="flex items-center gap-2 text-[#0A0A0A] hover:text-[#737373] transition-colors no-underline"
        >
          <Scale className="h-4 w-4" strokeWidth={1.75} />
          <span className="text-sm font-semibold tracking-tight">GuíasMX</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} pathname={pathname} {...link} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <UserMenu />

          <Sheet>
            <SheetTrigger
              id="mobile-menu-trigger"
              aria-label="Abrir menú de navegación"
              className="flex items-center justify-center rounded p-1.5 text-[#737373] hover:bg-[#F3F4F6] hover:text-[#0A0A0A] transition-colors md:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-72 bg-white border-[#E5E7EB] p-0">
              <SheetHeader className="px-6 pt-6 pb-4">
                <SheetTitle className="flex items-center gap-2 text-[#0A0A0A]">
                  <Scale className="h-4 w-4" strokeWidth={1.75} />
                  GuíasMX
                </SheetTitle>
              </SheetHeader>

              <Separator className="bg-[#E5E7EB]" />

              <nav className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    pathname={pathname}
                    {...link}
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
