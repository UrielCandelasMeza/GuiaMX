import Link from "next/link";
import { UserPlus, MessageSquare, FileCheck, Scale } from "lucide-react";

/* ── Datos ───────────────────────────────────────────────────────────────── */
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
  "Licencia vehicular y placa",
  "Identificación secundaria",
] as const;

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/login", label: "Iniciar sesión" },
  { href: "/registro", label: "Registro" },
  { href: "/tramites", label: "Trámites" },
] as const;

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="flex min-h-[70vh] items-center bg-brand-900 text-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          {/* Chip */}
          <span className="mb-6 inline-block rounded bg-brand-600/20 px-3 py-1 text-sm tracking-wide text-blue-200">
            Sistema Inteligente de Trámites
          </span>

          {/* Heading */}
          <h1 className="mt-2 text-4xl font-bold leading-tight text-white md:text-5xl">
            Realiza tus trámites con ayuda de inteligencia artificial
          </h1>

          {/* Subtítulo */}
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-blue-200">
            TrámitesMX te orienta a través de cualquier gestión gubernamental en
            México: reúne tus documentos, conoce los pasos exactos y sigue el
            avance de tu trámite en un solo lugar.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              id="hero-cta-registro"
              className="rounded px-6 py-2.5 text-sm font-semibold text-brand-900 bg-white hover:bg-brand-50 transition-colors no-underline"
            >
              Comenzar ahora
            </Link>
            <Link
              href="/login"
              id="hero-cta-login"
              className="rounded border border-white px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors no-underline"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-brand-800">
            ¿Cómo funciona?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-brand-900/95">
            Tres pasos simples para que cualquier ciudadano pueda gestionar sus
            trámites sin complicaciones.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }, i) => (
              <article
                key={title}
                className="rounded-md border border-slate-200 bg-white p-6"
              >
                {/* Número de paso */}
                <span className="label-xs mb-3 block text-brand-900/95 ">
                  Paso {i + 1}
                </span>
                {/* Ícono */}
                <div className="mb-4 inline-flex rounded bg-brand-100 p-2 text-brand-600">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-brand-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-900/95">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTOS ────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-brand-800">
            Documentos que el sistema reconoce
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-brand-900/95">
            El asistente identifica y te indica exactamente cuáles de estos
            documentos necesitas para cada trámite.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {DOCUMENTOS.map((doc) => (
              <span
                key={doc}
                className="rounded border border-brand-100 bg-brand-50 px-3 py-1 text-sm text-brand-800"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-900 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white">
            Empieza a simplificar tus trámites hoy
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-blue-200">
            Regístrate gratis y accede a tu asistente personalizado de trámites
            gubernamentales.
          </p>
          <Link
            href="/registro"
            id="cta-final-registro"
            className="mt-8 inline-block rounded px-8 py-2.5 text-sm font-semibold text-brand-900 bg-white hover:bg-brand-50 transition-colors no-underline"
          >
            Crear cuenta
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-brand-800 bg-brand-950 px-6 py-10 text-blue-200">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-3">
            {/* Col 1 — Identidad */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-200" strokeWidth={1.5} />
                <span className="text-base font-semibold text-white">
                  TrámitesMX
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                Plataforma de orientación ciudadana para trámites
                gubernamentales en México, respaldada por inteligencia
                artificial.
              </p>
            </div>

            {/* Col 2 — Links */}
            <div>
              <p className="label-xs mb-4 text-blue-200/60">Navegación</p>
              <ul className="flex flex-col gap-2">
                {FOOTER_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-blue-200 no-underline transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Legal */}
            <div>
              <p className="label-xs mb-4 text-blue-200/60">Legal</p>
              <p className="text-sm leading-relaxed">
                Este sistema es una herramienta de orientación y no sustituye la
                consulta oficial con las dependencias gubernamentales.
              </p>
              <p className="mt-4 text-xs text-blue-200/60">
                © 2025 TrámitesMX. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
