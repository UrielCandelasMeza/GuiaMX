import Link from "next/link";
import { FileText, MessageCircle, Menu } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-800 bg-brand-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            Guía<span className="text-brand-100">MX</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/tramites"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-100 transition-colors hover:text-white"
          >
            <FileText className="h-4 w-4" />
            Trámites
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-100 transition-colors hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Asistente IA
          </Link>
        </nav>

        {/* Mobile menu placeholder */}
        <button
          aria-label="Abrir menú"
          className="rounded-md p-2 text-brand-100 hover:bg-brand-900 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
