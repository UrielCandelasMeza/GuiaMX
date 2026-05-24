# Prompts de Implementación — API GuiaMX

> Documento de referencia con los prompts necesarios para implementar cada módulo de la API.
> Cada prompt está diseñado para ser ejecutado de manera secuencial.
> **Stack actual:** Bun + Express + Prisma (PostgreSQL con `@prisma/adapter-pg`) + Azure OpenAI (`openai` SDK) + JWT + bcryptjs

---

## Índice

1. [Middleware de Autenticación JWT](#1-middleware-de-autenticación-jwt)
2. [CRUD de Documentos del Usuario](#2-crud-de-documentos-del-usuario)
3. [Seed de Tipos de Documento y Trámites](#3-seed-de-tipos-de-documento-y-trámites)
4. [CRUD de Trámites y Pasos](#4-crud-de-trámites-y-pasos)
5. [Sesiones con Resumen de LLM](#5-sesiones-con-resumen-de-llm)
6. [LLM con Function Calling para Modificar la BD](#6-llm-con-function-calling-para-modificar-la-bd)
7. [WebSocket para Chat en Tiempo Real](#7-websocket-para-chat-en-tiempo-real)
8. [Endpoint de Contexto Completo para el LLM](#8-endpoint-de-contexto-completo-para-el-llm)

---

## 1. Middleware de Autenticación JWT

```
Crea un middleware de autenticación JWT para Express en el proyecto.

Contexto del proyecto:
- Runtime: Bun
- Framework: Express 4
- JWT: ya existe `src/lib/jwt.ts` que exporta `signToken(payload)` y `verifyToken<T>(token)` usando jsonwebtoken
- Prisma: el cliente se importa desde `../lib/prisma` como `{ prisma }`
- Modelo User: tiene campos id, nombre, apellidos, correo, password
- El token se envía en el header Authorization como "Bearer <token>"
- El payload del token contiene: sub (userId), correo, nombre, apellidos

Crea el archivo `src/middleware/auth.middleware.ts` que:
1. Exporte una función `authMiddleware` compatible con Express (req, res, next)
2. Extraiga el token del header `Authorization: Bearer <token>`
3. Verifique el token usando `verifyToken` de `../lib/jwt`
4. Busque al usuario en la BD con prisma.user.findUnique usando el `sub` del payload
5. Si el usuario existe, adjunte el objeto user a `req.user` (sin el campo password)
6. Si falla cualquier paso, responda con 401 y un JSON de error
7. Crea también el archivo `src/types/express.d.ts` que extienda la interfaz Request de Express para incluir la propiedad `user` con los campos: id, nombre, apellidos, correo

No modifiques ningún archivo existente, solo crea los dos archivos nuevos.
```

---

## 2. CRUD de Documentos del Usuario

```
Crea el controlador y las rutas para gestionar los documentos que posee un usuario.

Contexto del proyecto:
- Runtime: Bun, Framework: Express 4
- Prisma client: import { prisma } from "../lib/prisma"
- Middleware de auth: import { authMiddleware } from "../middleware/auth.middleware"
  - Después de pasar auth, req.user contiene: { id, nombre, apellidos, correo }
- Modelos relevantes en Prisma:
  - TipoDocumento: id, tipo (enum TipoDocumentoEnum), nombre, descripcion, obligatorio
  - UserDocumento: id, userId, tipoDocumentoId, verificado, notas, creadoEn
  - TipoDocumentoEnum: CURP, LLAVE_MX, ACTA_NACIMIENTO, EFIRMA, INE, PASAPORTE, CARTILLA_MILITAR, COMPROBANTE_DOMICILIO, LLAVE_CDMX, CORREO_PERSONAL, CERTIFICACION_ACADEMICA, NUMERO_TELEFONO, NSS, RFC, LICENCIA_VEHICULAR_PLACA, IDENTIFICACION_SECUNDARIA
- Los documentos NO se almacenan como archivos, solo se registra que el usuario los tiene (metadata booleana)

Crea los siguientes archivos:

1. `src/controllers/documentos.controller.ts` con las funciones:
   - `listarTiposDocumento`: GET — devuelve todos los TipoDocumento disponibles en el sistema
   - `obtenerDocumentosUsuario`: GET — devuelve todos los UserDocumento del usuario autenticado, incluyendo el TipoDocumento relacionado
   - `agregarDocumento`: POST — recibe `{ tipoDocumentoId, notas? }` y crea un UserDocumento para el usuario autenticado. Debe validar que el tipoDocumentoId existe y que no haya duplicado (el unique constraint userId+tipoDocumentoId)
   - `eliminarDocumento`: DELETE /:id — elimina un UserDocumento del usuario autenticado, verificando que le pertenece
   - `verificarDocumento`: PATCH /:id — actualiza `verificado = true` en un UserDocumento del usuario autenticado

2. `src/routes/documentos.routes.ts`:
   - GET /tipos → listarTiposDocumento (con authMiddleware)
   - GET / → obtenerDocumentosUsuario (con authMiddleware)
   - POST / → agregarDocumento (con authMiddleware)
   - DELETE /:id → eliminarDocumento (con authMiddleware)
   - PATCH /:id/verificar → verificarDocumento (con authMiddleware)

3. Registra el router en `src/index.ts` bajo el prefijo `/documentos`

Todas las respuestas deben ser JSON con manejo de errores try/catch y códigos HTTP apropiados.
```

---

## 3. Seed de Tipos de Documento y Trámites

```
Crea un script de seed para poblar la base de datos con datos iniciales.

Contexto del proyecto:
- Runtime: Bun
- Prisma client: import { PrismaClient } from "../../generated/prisma/client" (para scripts standalone)
  - Necesita también el adapter: import { PrismaPg } from "@prisma/adapter-pg"
  - connectionString: process.env.DATABASE_URL
- Ejecutar con: bun run --env-file=.env prisma/seed.ts

Crea el archivo `prisma/seed.ts` que:

1. Inserte los 16 TipoDocumento del enum TipoDocumentoEnum:
   - CURP → "CURP"
   - LLAVE_MX → "Llave MX"
   - ACTA_NACIMIENTO → "Acta de Nacimiento"
   - EFIRMA → "e.Firma (FIEL)"
   - INE → "INE / Credencial de Elector"
   - PASAPORTE → "Pasaporte"
   - CARTILLA_MILITAR → "Cartilla Militar"
   - COMPROBANTE_DOMICILIO → "Comprobante de Domicilio"
   - LLAVE_CDMX → "Llave CDMX"
   - CORREO_PERSONAL → "Correo Personal"
   - CERTIFICACION_ACADEMICA → "Cédula Profesional / Certificación Académica"
   - NUMERO_TELEFONO → "Número de Teléfono"
   - NSS → "Número de Seguro Social (NSS)"
   - RFC → "Registro Federal de Contribuyentes (RFC)"
   - LICENCIA_VEHICULAR_PLACA → "Licencia Vehicular y Placa"
   - IDENTIFICACION_SECUNDARIA → "Identificación Secundaria"
   Usa upsert con el campo `tipo` como unique key para que sea idempotente.

2. Inserte al menos 3 trámites de ejemplo con sus pasos y documentos requeridos:

   Trámite 1: "Obtener CURP por primera vez"
   - Monto: 0 (gratis)
   - Documentos previos: ACTA_NACIMIENTO, INE
   - Pasos:
     1. "Ingresar al portal gob.mx/curp" → sin anteriores
     2. "Llenar formulario con datos personales" → anterior: paso 1
     3. "Descargar documento CURP" → anterior: paso 2

   Trámite 2: "Obtener Pasaporte"
   - Monto: 1640.00
   - Documentos previos: CURP, ACTA_NACIMIENTO, INE, COMPROBANTE_DOMICILIO
   - Pasos:
     1. "Agendar cita en la SRE" → sin anteriores
     2. "Reunir documentos requeridos" → anterior: paso 1, documentos del paso: CURP, ACTA_NACIMIENTO, INE, COMPROBANTE_DOMICILIO
     3. "Realizar pago en ventanilla bancaria o en línea" → anterior: paso 2
     4. "Asistir a la cita con documentos originales" → anterior: paso 3
     5. "Recoger pasaporte o recibir por mensajería" → anterior: paso 4

   Trámite 3: "Obtener RFC con Homoclave"
   - Monto: 0 (gratis)
   - Documentos previos: CURP, INE, COMPROBANTE_DOMICILIO, CORREO_PERSONAL
   - Pasos:
     1. "Ingresar al portal del SAT" → sin anteriores
     2. "Iniciar preinscripción en línea" → anterior: paso 1
     3. "Agendar cita en oficina del SAT" → anterior: paso 2
     4. "Asistir a cita con documentos originales" → anterior: paso 3
     5. "Recibir cédula de identificación fiscal" → anterior: paso 4

3. Use transacciones ($transaction) para asegurar atomicidad.
4. Al finalizar, imprima un resumen de lo insertado.
5. Agrega el campo "prisma.seed" en package.json apuntando a: "bun run --env-file=.env prisma/seed.ts"
```

---

## 4. CRUD de Trámites y Pasos

```
Crea el controlador y las rutas para consultar trámites y sus pasos.

Contexto del proyecto:
- Runtime: Bun, Framework: Express 4
- Prisma client: import { prisma } from "../lib/prisma"
- Middleware de auth: import { authMiddleware } from "../middleware/auth.middleware"
- Modelos relevantes:
  - Tramite: id, nombre, descripcion, monto, activo, documentosPrevios (→ TramiteDocumento), pasos (→ Paso)
  - Paso: id, tramiteId, orden, titulo, descripcionCorta, descripcionLarga, anteriores (→ PasoDependencia), siguientes (→ PasoDependencia), documentosRequeridos (→ PasoDocumento)
  - TramiteUsuario: id, userId, tramiteId, estado (PENDIENTE|EN_PROGRESO|COMPLETADO|CANCELADO), pasos (→ TramiteUsuarioPaso)
  - TramiteUsuarioPaso: id, tramiteUsuarioId, pasoId, estado (PENDIENTE|EN_PROGRESO|COMPLETADO|OMITIDO)

Crea los siguientes archivos:

1. `src/controllers/tramites.controller.ts` con las funciones:
   - `listarTramites`: GET — devuelve todos los trámites activos con sus documentosPrevios (incluyendo tipoDocumento) y conteo de pasos
   - `obtenerTramite`: GET /:id — devuelve un trámite específico con todos sus pasos ordenados por `orden`, cada paso con sus dependencias (anteriores/siguientes) y documentosRequeridos. También incluye los documentosPrevios del trámite
   - `iniciarTramite`: POST /:id/iniciar — crea un TramiteUsuario para el usuario autenticado en estado PENDIENTE, y crea todos los TramiteUsuarioPaso correspondientes en estado PENDIENTE. Debe validar que el trámite existe, está activo, y que el usuario no lo haya iniciado ya
   - `obtenerMisTramites`: GET /mis-tramites — devuelve todos los TramiteUsuario del usuario autenticado con el trámite relacionado y el estado de cada paso
   - `actualizarEstadoPaso`: PATCH /mis-tramites/:tramiteUsuarioId/pasos/:pasoId — actualiza el estado de un TramiteUsuarioPaso. Debe validar que pertenece al usuario y que los pasos anteriores estén completados antes de poder avanzar

2. `src/routes/tramites.routes.ts`:
   - GET / → listarTramites (con authMiddleware)
   - GET /mis-tramites → obtenerMisTramites (con authMiddleware)
   - GET /:id → obtenerTramite (con authMiddleware)
   - POST /:id/iniciar → iniciarTramite (con authMiddleware)
   - PATCH /mis-tramites/:tramiteUsuarioId/pasos/:pasoId → actualizarEstadoPaso (con authMiddleware)

3. Registra el router en `src/index.ts` bajo el prefijo `/tramites`

Importante: la ruta /mis-tramites debe estar ANTES de /:id para que Express no interprete "mis-tramites" como un :id.
```

---

## 5. Sesiones con Resumen de LLM

```
Crea el sistema de sesiones que guarda un resumen de la última conversación del usuario usando el LLM.

Contexto del proyecto:
- Runtime: Bun, Framework: Express 4
- Azure OpenAI client: import client from "../lib/azure" (instancia de OpenAI SDK, usa client.responses.create con model: "gpt-4.1-mini")
- Prisma client: import { prisma } from "../lib/prisma"
- Middleware de auth: import { authMiddleware } from "../middleware/auth.middleware"
- Modelos relevantes:
  - Session: id, userId, token, resumen (Text nullable), expiresAt, createdAt, updatedAt
  - ChatMessage: id, userId, sessionId, rol (USER|ASSISTANT|SYSTEM), contenido (Text), metadata (Json), createdAt

Crea los siguientes archivos:

1. `src/services/resumen.service.ts`:
   - Exporta una función `generarResumen(mensajes: { rol: string, contenido: string }[]): Promise<string>`
   - Usa el client de Azure OpenAI para generar un resumen conciso de la conversación
   - El prompt del sistema debe indicar: "Genera un resumen conciso en español de la siguiente conversación entre un usuario y un asistente de trámites gubernamentales mexicanos. El resumen debe capturar: qué trámite se discutió, qué documentos se mencionaron, qué pasos se completaron y qué quedó pendiente. Máximo 200 palabras."
   - Los mensajes se formatean como input para el modelo

2. `src/controllers/sesiones.controller.ts` con las funciones:
   - `crearSesion`: se ejecuta automáticamente al hacer login (modifica auth.controller.ts). Crea una Session con token = JWT generado, expiresAt = 24h, sin resumen
   - `obtenerResumenUltimaSesion`: GET — obtiene la sesión más reciente del usuario que tenga resumen
   - `cerrarSesion`: POST /cerrar — toma todos los ChatMessage de la sesión actual, llama a generarResumen, actualiza el campo resumen de la Session actual, y marca la sesión como expirada

3. `src/routes/sesiones.routes.ts`:
   - GET /resumen → obtenerResumenUltimaSesion (con authMiddleware)
   - POST /cerrar → cerrarSesion (con authMiddleware)

4. Modifica `src/controllers/auth.controller.ts`:
   - En la función login, después de generar el token, crea una Session en la BD
   - Devuelve el sessionId junto con el token en la respuesta

5. Registra el router en `src/index.ts` bajo el prefijo `/sesiones`
```

---

## 6. LLM con Function Calling para Modificar la BD

```
Implementa la integración del LLM con function calling para que pueda consultar y modificar la base de datos a través de funciones definidas en la API.

Contexto del proyecto:
- Runtime: Bun
- Azure OpenAI client: import client from "../lib/azure" (OpenAI SDK, model: "gpt-4.1-mini")
  - El client usa client.responses.create({ model, instructions, input, tools })
  - Para function calling, se usa tools con type: "function" y el modelo responde con output que contiene tool calls
- Prisma client: import { prisma } from "../lib/prisma"
- Documentos disponibles (enum): CURP, LLAVE_MX, ACTA_NACIMIENTO, EFIRMA, INE, PASAPORTE, CARTILLA_MILITAR, COMPROBANTE_DOMICILIO, LLAVE_CDMX, CORREO_PERSONAL, CERTIFICACION_ACADEMICA, NUMERO_TELEFONO, NSS, RFC, LICENCIA_VEHICULAR_PLACA, IDENTIFICACION_SECUNDARIA

Crea los siguientes archivos:

1. `src/services/tools.ts` — Define las tools/funciones que el LLM puede invocar:

   a. `obtener_documentos_usuario`: Consulta los documentos que tiene el usuario
      - Parámetros: { userId: string }
      - Ejecuta: prisma.userDocumento.findMany con include tipoDocumento

   b. `agregar_documento_usuario`: Registra que el usuario posee un documento
      - Parámetros: { userId: string, tipoDocumento: TipoDocumentoEnum }
      - Ejecuta: buscar el TipoDocumento por enum, luego prisma.userDocumento.create

   c. `eliminar_documento_usuario`: Elimina un documento del usuario
      - Parámetros: { userId: string, tipoDocumento: TipoDocumentoEnum }
      - Ejecuta: buscar y eliminar el UserDocumento correspondiente

   d. `buscar_tramites`: Busca trámites disponibles
      - Parámetros: { query?: string }
      - Ejecuta: prisma.tramite.findMany con filtro por nombre si se pasa query

   e. `obtener_detalle_tramite`: Obtiene los pasos y documentos de un trámite
      - Parámetros: { tramiteId: string }
      - Ejecuta: prisma.tramite.findUnique con include de pasos, documentosPrevios, etc.

   f. `iniciar_tramite_usuario`: Inicia un trámite para el usuario
      - Parámetros: { userId: string, tramiteId: string }
      - Ejecuta: crear TramiteUsuario y TramiteUsuarioPasos

   g. `obtener_tramites_usuario`: Consulta los trámites activos del usuario
      - Parámetros: { userId: string }
      - Ejecuta: prisma.tramiteUsuario.findMany con includes

   h. `actualizar_estado_paso`: Actualiza el estado de un paso de trámite
      - Parámetros: { tramiteUsuarioId: string, pasoId: string, estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADO" | "OMITIDO" }
      - Ejecuta: prisma.tramiteUsuarioPaso.update

   Cada tool debe exportarse en dos formas:
   - La definición JSON Schema para pasarla al LLM (array de tool definitions)
   - La función ejecutora que recibe los argumentos y retorna el resultado

2. `src/services/llm.service.ts` — Orquestador del loop de function calling:
   - Exporta una función `procesarMensajeLLM(params: { userId: string, sessionId: string, mensaje: string, historial: ChatMessage[] }): Promise<string>`
   - System prompt: "Eres GuíaMX, un asistente especializado en trámites gubernamentales mexicanos. Ayudas a los usuarios a entender qué documentos necesitan, los guías paso a paso en sus trámites, y puedes consultar y actualizar su información. Siempre responde en español. Sé amable, claro y conciso. Cuando el usuario mencione que tiene o no tiene un documento, usa las funciones disponibles para actualizar su perfil. Cuando pregunte por un trámite, busca la información y explícala paso a paso."
   - Implementa el loop de function calling:
     1. Envía el mensaje al modelo con las tools definidas
     2. Si el modelo responde con tool_calls, ejecuta cada función
     3. Envía los resultados de vuelta al modelo como tool results
     4. Repite hasta que el modelo responda con texto final
   - Guarda cada mensaje (usuario y asistente) en ChatMessage via prisma
   - Retorna el texto final del asistente

Asegúrate de que las tool definitions sigan el formato exacto del OpenAI SDK:
{
  type: "function",
  name: "nombre_funcion",
  description: "descripción",
  parameters: { type: "object", properties: {...}, required: [...] }
}
```

---

## 7. WebSocket para Chat en Tiempo Real

```
Implementa la conexión WebSocket en el servidor Express para el chat en tiempo real con el LLM.

Contexto del proyecto:
- Runtime: Bun
- Express 4 corriendo en src/index.ts en el puerto process.env.PORT || 3000
- LLM service: import { procesarMensajeLLM } from "./services/llm.service" (creado en el prompt anterior)
- JWT: import { verifyToken } from "./lib/jwt"
- Prisma: import { prisma } from "./lib/prisma"
- Modelo ChatMessage: id, userId, sessionId, rol (USER|ASSISTANT|SYSTEM), contenido, metadata, createdAt

Instala la dependencia `ws` y `@types/ws`:
- bun add ws
- bun add -d @types/ws

Crea/modifica los siguientes archivos:

1. `src/ws/chat.ws.ts` — Handler del WebSocket:
   - Exporta una función `setupWebSocket(server: http.Server)` que:
     a. Crea un WebSocketServer de `ws` adjunto al server HTTP, en el path "/ws"
     b. En la conexión, extrae el token del query string: ws://host/ws?token=JWT_TOKEN
     c. Verifica el token con verifyToken. Si falla, cierra la conexión con código 4001
     d. Al recibir un mensaje del cliente (JSON: { type: "message", content: string, sessionId: string }):
        - Obtiene el historial reciente de ChatMessage del usuario (últimos 20 mensajes)
        - Llama a procesarMensajeLLM con userId, sessionId, mensaje y historial
        - Envía la respuesta al cliente como JSON: { type: "response", content: string }
     e. Maneja errores enviando: { type: "error", content: string }
     f. Al desconectar, limpia recursos

2. Modifica `src/index.ts`:
   - Importa `http` de node
   - Importa `setupWebSocket` desde "./ws/chat.ws"
   - Cambia app.listen por: const server = http.createServer(app); setupWebSocket(server); server.listen(port, ...)
   - Mantén todo el código existente (connectDB, responsegg, rutas, etc.)

El WebSocket debe:
- Autenticar con JWT antes de aceptar mensajes
- Manejar múltiples conexiones simultáneas
- Enviar mensajes de error si algo falla
- Hacer ping/pong cada 30 segundos para mantener la conexión
```

---

## 8. Endpoint de Contexto Completo para el LLM

```
Crea un servicio que arme el contexto completo del usuario para enviarlo al LLM antes de cada interacción.

Contexto del proyecto:
- Runtime: Bun
- Prisma client: import { prisma } from "../lib/prisma"
- Este contexto se usará en el system prompt del LLM como información adicional sobre el usuario

Crea el archivo `src/services/contexto.service.ts` que exporte una función:

`armarContextoUsuario(userId: string): Promise<string>`

Esta función debe:
1. Consultar el usuario (nombre, apellidos, correo)
2. Consultar los documentos que tiene el usuario (UserDocumento con TipoDocumento)
3. Consultar los documentos que NO tiene (comparar con todos los TipoDocumento)
4. Consultar los trámites activos del usuario (TramiteUsuario con Tramite y TramiteUsuarioPasos)
5. Consultar el resumen de la última sesión (Session más reciente con resumen no nulo)

Retornar un string formateado así:

=== CONTEXTO DEL USUARIO ===
Nombre: {nombre} {apellidos}
Correo: {correo}

--- Documentos que posee ---
✅ CURP (verificado)
✅ INE (no verificado)
...

--- Documentos que le faltan ---
❌ Pasaporte
❌ Cartilla Militar
...

--- Trámites activos ---
📋 Obtener Pasaporte — Estado: EN_PROGRESO
   Paso 1: Agendar cita en la SRE ✅
   Paso 2: Reunir documentos ⏳
   Paso 3: Realizar pago ⬜
   ...

--- Resumen de la última sesión ---
{resumen o "Sin sesiones previas"}
=== FIN DEL CONTEXTO ===

Luego modifica `src/services/llm.service.ts` para que:
- Al inicio de `procesarMensajeLLM`, llame a `armarContextoUsuario(userId)`
- Inyecte el contexto resultante en el system prompt (instructions) del LLM, concatenándolo después del prompt base de GuíaMX
```

---

> **IMPORTANTE:** Los prompts están numerados en el orden en que deben ejecutarse, ya que cada uno puede depender de archivos creados por el anterior.

> **TIP:** Después de cada prompt, ejecuta `bun run dev` para verificar que no hay errores de compilación antes de continuar con el siguiente.
