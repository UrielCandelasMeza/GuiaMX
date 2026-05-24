import Link from "next/link";
import { ArrowRight, UserPlus, MessageSquare, FileCheck, Scale } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Regístrate",
    description:
      "Crea tu cuenta en minutos con tu correo electrónico. Sin trámites previos ni formularios complicados.",
  },
  {
    icon: MessageSquare,
    title: "Consulta al asistente",
    description:
      "Describe en tus propias palabras qué trámite necesitas. Nuestro asistente de IA te guiará paso a paso.",
  },
  {
    icon: FileCheck,
    title: "Completa tu trámite",
    description:
      "Obtén una lista personalizada de documentos, plazos y ventanillas. Sigue el progreso en tiempo real.",
  },
] as const;

const DOCUMENTOS = [
  "CURP",
  "LLAVE MX",
  "Acta de nacimiento",
  "EFirma",
  "INE",
  "Pasaporte",
  "Cartilla militar",
  "Comprobante de domicilio",
  "LLAVE CDMX",
  "Correo personal",
  "Cédula profesional",
  "Número de teléfono",
  "NSS",
  "RFC",
  "Licencia vehicular",
  "Identificación secundaria",
] as const;

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/login", label: "Iniciar sesión" },
  { href: "/registro", label: "Registro" },
  { href: "/tramites", label: "Trámites" },
] as const;

export default function LandingPage() {
  return (
    <>
      {/* ── ANNOUNCEMENT BANNER ───────────────────────────────────────────── */}
      <div className="w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 py-2.5 px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
          <p className="text-sm font-semibold text-white text-center">
            Nuevo: asistente de IA para trámites del SAT y CURP disponible ahora
          </p>
          <Link
            href="/registro"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white transition-colors no-underline shrink-0"
          >
            Pruébalo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav className="w-full border-b border-[#E5E7EB] bg-white px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#0A0A0A] hover:text-[#737373] transition-colors no-underline"
          >
            <Scale className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-sm font-semibold tracking-tight">GuíasMX</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/tramites" className="text-sm font-medium text-[#737373] hover:text-[#0A0A0A] transition-colors no-underline">
              Trámites
            </Link>
            <Link href="/login" className="text-sm font-medium text-[#737373] hover:text-[#0A0A0A] transition-colors no-underline">
              Iniciar sesión
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center rounded px-4 text-sm font-semibold text-[#0A0A0A] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors no-underline"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="inline-flex h-9 items-center rounded px-4 text-sm font-semibold text-white bg-[#0A0A0A] hover:bg-[#222222] transition-colors no-underline"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 pt-24 pb-28">
        <div className="mx-auto max-w-5xl">
          <div className="label-xs mb-6 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0A0A0A]" />
            DISPONIBLE PARA TODOS LOS CIUDADANOS MEXICANOS
          </div>

          <h1 className="max-w-4xl text-[3.5rem] md:text-[4.5rem] font-black tracking-tight leading-[1.02]">
            <span className="text-[#0A0A0A]">Realiza tus trámites </span>
            <span className="text-[#737373]">sin filas, sin confusión,</span>
            <span className="text-[#0A0A0A]"> con IA.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#737373]">
            GuíasMX te orienta en cualquier gestión gubernamental en México.
            Reúne documentos, conoce los pasos exactos y sigue tu avance en tiempo real.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/registro"
              className="inline-flex h-12 items-center rounded px-7 text-[15px] font-semibold text-white bg-[#0A0A0A] hover:bg-[#222222] transition-colors no-underline"
            >
              Comenzar gratis
            </Link>
            <Link
              href="/tramites"
              className="inline-flex h-12 items-center gap-1.5 rounded px-7 text-[15px] font-semibold text-[#0A0A0A] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors no-underline"
            >
              Ver trámites <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <div className="h-px w-6 bg-[#E5E7EB]" />
            <span className="label-xs">
              +16 documentos reconocidos · SAT · IMSS · SRE · INE
            </span>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section className="bg-[#F7F9FC] border-y border-[#E5E7EB] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="label-xs mb-4">CÓMO FUNCIONA</div>
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-[#0A0A0A]">
            Tres pasos para gestionar cualquier trámite
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#737373]">
            Sin complicaciones ni burocracia. Describe qué necesitas y nosotros hacemos el resto.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <article
                key={title}
                className="rounded-lg border border-[#E5E7EB] bg-white p-7 shadow-stripe"
              >
                <span className="label-xs mb-4 block text-[#A3A3A3]">
                  0{i + 1}
                </span>
                <div className="mb-4 inline-flex rounded-md border border-[#E5E7EB] p-2.5 text-[#0A0A0A]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-[#0A0A0A]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#737373]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTOS TRUST BAND ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E5E7EB] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="label-xs mb-8 text-center">DOCUMENTOS RECONOCIDOS</div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {DOCUMENTOS.map((doc) => (
              <span
                key={doc}
                className="text-sm font-semibold text-[#111111] tracking-tight"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="bg-[#F7F9FC] px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="label-xs mb-4">EMPIEZA HOY</div>
          <h2 className="text-[2.5rem] font-black tracking-tight text-[#0A0A0A] leading-tight">
            Simplifica tus trámites{" "}
            <span className="text-[#737373]">de una vez por todas.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-[#737373]">
            Regístrate gratis y accede a tu asistente personalizado de trámites gubernamentales.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/registro"
              className="inline-flex h-12 items-center rounded px-8 text-[15px] font-semibold text-white bg-[#0A0A0A] hover:bg-[#222222] transition-colors no-underline"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded px-8 text-[15px] font-semibold text-[#737373] hover:text-[#0A0A0A] transition-colors no-underline"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E5E7EB] bg-white px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#0A0A0A]" strokeWidth={1.75} />
                <span className="text-sm font-semibold text-[#0A0A0A]">
                  GuíassMX
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#737373]">
                Plataforma de orientación ciudadana para trámites gubernamentales en México.
              </p>
            </div>

            <div>
              <p className="label-xs mb-4">NAVEGACIÓN</p>
              <ul className="flex flex-col gap-2.5">
                {FOOTER_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-[#737373] hover:text-[#0A0A0A] no-underline transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label-xs mb-4">LEGAL</p>
              <p className="text-sm leading-relaxed text-[#737373]">
                Este sistema es una herramienta de orientación y no sustituye la
                consulta oficial con las dependencias gubernamentales.
              </p>
              <p className="mt-5 text-xs text-[#A3A3A3]">
                © 2025 GuíasMX. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
