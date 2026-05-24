-- CreateEnum
CREATE TYPE "TipoDocumentoEnum" AS ENUM ('CURP', 'LLAVE_MX', 'ACTA_NACIMIENTO', 'EFIRMA', 'INE', 'PASAPORTE', 'CARTILLA_MILITAR', 'COMPROBANTE_DOMICILIO', 'LLAVE_CDMX', 'CORREO_PERSONAL', 'CERTIFICACION_ACADEMICA', 'NUMERO_TELEFONO', 'NSS', 'RFC', 'LICENCIA_VEHICULAR_PLACA', 'IDENTIFICACION_SECUNDARIA');

-- CreateEnum
CREATE TYPE "EstadoTramite" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoPaso" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'OMITIDO');

-- CreateEnum
CREATE TYPE "RolMensaje" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "resumen" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDocumentoEnum" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documentos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramites" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tramites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramite_documentos" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tramite_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasos" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcionCorta" TEXT NOT NULL,
    "descripcionLarga" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pasos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paso_dependencias" (
    "id" TEXT NOT NULL,
    "anteriorId" TEXT NOT NULL,
    "siguienteId" TEXT NOT NULL,

    CONSTRAINT "paso_dependencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paso_documentos" (
    "id" TEXT NOT NULL,
    "pasoId" TEXT NOT NULL,
    "tipoDocumentoId" TEXT NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "paso_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramite_usuarios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "estado" "EstadoTramite" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "iniciadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEn" TIMESTAMP(3),

    CONSTRAINT "tramite_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramite_usuario_pasos" (
    "id" TEXT NOT NULL,
    "tramiteUsuarioId" TEXT NOT NULL,
    "pasoId" TEXT NOT NULL,
    "estado" "EstadoPaso" NOT NULL DEFAULT 'PENDIENTE',
    "completadoEn" TIMESTAMP(3),
    "notas" TEXT,

    CONSTRAINT "tramite_usuario_pasos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "rol" "RolMensaje" NOT NULL,
    "contenido" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_correo_key" ON "users"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_tipo_key" ON "tipos_documento"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "user_documentos_userId_tipoDocumentoId_key" ON "user_documentos"("userId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "tramite_documentos_tramiteId_tipoDocumentoId_key" ON "tramite_documentos"("tramiteId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "pasos_tramiteId_orden_key" ON "pasos"("tramiteId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "paso_dependencias_anteriorId_siguienteId_key" ON "paso_dependencias"("anteriorId", "siguienteId");

-- CreateIndex
CREATE UNIQUE INDEX "paso_documentos_pasoId_tipoDocumentoId_key" ON "paso_documentos"("pasoId", "tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "tramite_usuario_pasos_tramiteUsuarioId_pasoId_key" ON "tramite_usuario_pasos"("tramiteUsuarioId", "pasoId");

-- CreateIndex
CREATE INDEX "chat_messages_userId_createdAt_idx" ON "chat_messages"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documentos" ADD CONSTRAINT "user_documentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documentos" ADD CONSTRAINT "user_documentos_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipos_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_documentos" ADD CONSTRAINT "tramite_documentos_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_documentos" ADD CONSTRAINT "tramite_documentos_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipos_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasos" ADD CONSTRAINT "pasos_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paso_dependencias" ADD CONSTRAINT "paso_dependencias_anteriorId_fkey" FOREIGN KEY ("anteriorId") REFERENCES "pasos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paso_dependencias" ADD CONSTRAINT "paso_dependencias_siguienteId_fkey" FOREIGN KEY ("siguienteId") REFERENCES "pasos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paso_documentos" ADD CONSTRAINT "paso_documentos_pasoId_fkey" FOREIGN KEY ("pasoId") REFERENCES "pasos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paso_documentos" ADD CONSTRAINT "paso_documentos_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipos_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_usuarios" ADD CONSTRAINT "tramite_usuarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_usuarios" ADD CONSTRAINT "tramite_usuarios_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_usuario_pasos" ADD CONSTRAINT "tramite_usuario_pasos_tramiteUsuarioId_fkey" FOREIGN KEY ("tramiteUsuarioId") REFERENCES "tramite_usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramite_usuario_pasos" ADD CONSTRAINT "tramite_usuario_pasos_pasoId_fkey" FOREIGN KEY ("pasoId") REFERENCES "pasos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
