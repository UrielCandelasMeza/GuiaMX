"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";

import AuthPanel from "@/components/auth/AuthPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ── Schema ──────────────────────────────────────────────────────────────── */
const schema = z.object({
  correo: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginFormData = z.infer<typeof schema>;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-secondary"
      >
        {label}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <span>{message}</span>
    </div>
  );
}

/* ── Inner form (needs useSearchParams → must be inside Suspense) ─────────── */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setAuthError(null);

    try {
      const result = await signIn("credentials", {
        correo: data.correo,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Correo o contraseña incorrectos.");
      } else if (result?.ok) {
        router.push("/chat");
        router.refresh();
      }
    } catch {
      setAuthError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Encabezado */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-900">Iniciar sesión</h2>
        <p className="mt-1 text-sm text-secondary">
          Ingresa tus datos para continuar.
        </p>
      </div>

      {/* Alerta de error de URL (?error=) */}
      {urlError && (
        <div className="mb-5">
          <ErrorAlert message="Tu sesión expiró o hubo un problema. Vuelve a iniciar sesión." />
        </div>
      )}

      {/* Formulario */}
      <form
        id="login-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Field
          id="correo"
          label="Correo electrónico"
          error={errors.correo?.message}
        >
          <Input
            id="correo"
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            aria-invalid={!!errors.correo}
            {...register("correo")}
          />
        </Field>

        <Field
          id="password"
          label="Contraseña"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        {/* Error de autenticación — debajo del formulario */}
        {authError && <ErrorAlert message={authError} />}

        <Button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="mt-2 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Verificando…
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-brand-600 hover:text-brand-800 no-underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthPanel
        title="GuiaMX"
        description="Accede a tu asistente de trámites gubernamentales y consulta el estado de tus gestiones."
      />

      <div className="flex flex-col items-center justify-center bg-white px-6 py-12">
        {/* Suspense requerido por useSearchParams en Next.js App Router */}
        <Suspense
          fallback={
            <div className="h-96 w-full max-w-md animate-pulse rounded bg-surface" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
