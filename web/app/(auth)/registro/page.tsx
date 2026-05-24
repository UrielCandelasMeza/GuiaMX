"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import AuthPanel from "@/components/auth/AuthPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ── Schema ──────────────────────────────────────────────────────────────── */
const schema = z
  .object({
    nombre: z.string().min(2, "Ingresa tu nombre"),
    apellidos: z.string().min(2, "Ingresa tus apellidos"),
    correo: z.string().email("Correo inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmar: z.string(),
  })
  .refine((data) => data.password === data.confirmar, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar"],
  });

type RegistroFormData = z.infer<typeof schema>;

/* ── Field helper ────────────────────────────────────────────────────────── */
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
        className="text-xs font-semibold uppercase tracking-wide text-brand-900/95"
      >
        {label}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegistroFormData) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: data.nombre,
            apellidos: data.apellidos,
            correo: data.correo,
            password: data.password,
          }),
        },
      );

      if (res.status === 201) {
        toast.success("¡Cuenta creada! Ahora puedes iniciar sesión.");
        router.push("/login");
      } else {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        toast.error(
          body.message ?? "Error al crear la cuenta. Inténtalo de nuevo.",
        );
      }
    } catch {
      toast.error("Error de conexión. Verifica tu red e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel institucional izquierdo */}
      <AuthPanel
        title="GuiaMX"
        description="Crea tu cuenta para acceder a tu asistente de trámites gubernamentales y hacer seguimiento personalizado."
      />

      {/* Panel derecho — formulario */}
      <div className="flex flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-900">Crear cuenta</h2>
            <p className="mt-1 text-sm text-brand-900/95">
              Completa los datos para registrarte.
            </p>
          </div>

          {/* Formulario */}
          <form
            id="registro-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Nombre */}
            <Field id="nombre" label="Nombre" error={errors.nombre?.message}>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                autoComplete="given-name"
                aria-invalid={!!errors.nombre}
                {...register("nombre")}
              />
            </Field>

            {/* Apellidos */}
            <Field
              id="apellidos"
              label="Apellidos"
              error={errors.apellidos?.message}
            >
              <Input
                id="apellidos"
                type="text"
                placeholder="Tus apellidos"
                autoComplete="family-name"
                aria-invalid={!!errors.apellidos}
                {...register("apellidos")}
              />
            </Field>

            {/* Correo */}
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

            {/* Contraseña */}
            <Field
              id="password"
              label="Contraseña"
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
            </Field>

            {/* Confirmar contraseña */}
            <Field
              id="confirmar"
              label="Confirmar contraseña"
              error={errors.confirmar?.message}
            >
              <Input
                id="confirmar"
                type="password"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmar}
                {...register("confirmar")}
              />
            </Field>

            {/* Submit */}
            <Button
              id="registro-submit"
              type="submit"
              disabled={loading}
              className="mt-2 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creando cuenta…
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          {/* Link a login */}
          <p className="mt-6 text-center text-sm text-brand-900/95">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:text-brand-800 no-underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
