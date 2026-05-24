import client from "../lib/azure";
import { prisma } from "../lib/prisma";
import { TOOL_DEFINITIONS, ejecutarTool } from "./tools";
import type { RolMensaje } from "../../generated/prisma/enums";

const MODEL = "gpt-4.1-mini";

const SYSTEM_PROMPT_BASE = `Eres GuíaMX, un asistente especializado en trámites gubernamentales mexicanos.
Ayudas a los usuarios a entender qué documentos necesitan, los guías paso a paso en sus trámites, y puedes consultar y actualizar su información.
Siempre responde en español. Sé amable, claro y conciso.
Cuando el usuario mencione que tiene o no tiene un documento, usa las funciones disponibles para actualizar su perfil.
Cuando pregunte por un trámite, busca la información y explícala paso a paso.`;

interface HistorialMensaje {
  rol: RolMensaje;
  contenido: string;
}

/**
 * Orquesta el loop de function calling con el LLM.
 * 1. Envía el mensaje con historial y tools
 * 2. Si hay tool_calls, ejecuta cada función y devuelve resultados
 * 3. Repite hasta que el modelo responda con texto
 * 4. Guarda los mensajes del usuario y asistente en ChatMessage
 */
export async function procesarMensajeLLM(params: {
  userId: string;
  sessionId: string;
  mensaje: string;
  historial: HistorialMensaje[];
  contextExtra?: string; // contexto del usuario inyectado desde contexto.service
}): Promise<string> {
  const { userId, sessionId, mensaje, historial, contextExtra } = params;

  // Guardar el mensaje del usuario en BD
  await prisma.chatMessage.create({
    data: {
      userId,
      sessionId,
      rol: "USER" as RolMensaje,
      contenido: mensaje,
    },
  });

  // Construir el system prompt con contexto opcional del usuario
  const instructions = contextExtra
    ? `${SYSTEM_PROMPT_BASE}\n\n${contextExtra}`
    : SYSTEM_PROMPT_BASE;

  // Construir el historial de mensajes en formato OpenAI
  const inputMessages = [
    ...historial.map((m) => ({
      role: m.rol === "USER" ? "user" : ("assistant" as "user" | "assistant"),
      content: m.contenido,
    })),
    { role: "user" as const, content: mensaje },
  ];

  // Loop de function calling
  let respuestaFinal = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentInput: any = inputMessages;
  const MAX_LOOPS = 8;

  for (let i = 0; i < MAX_LOOPS; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.responses as any).create({
      model: MODEL,
      instructions,
      input: currentInput,
      tools: TOOL_DEFINITIONS,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output: any[] = response.output ?? [];

    // Separar tool calls de mensajes de texto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCalls = output.filter((o: any) => o.type === "function_call");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mensajeTexto = output.find((o: any) => o.type === "message");

    if (toolCalls.length === 0) {
      // El modelo respondió con texto — fin del loop
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      respuestaFinal = (mensajeTexto?.content ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((c: any) => c.type === "output_text")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => c.text as string)
        .join("") || "Lo siento, no pude generar una respuesta.";
      break;
    }

    // Ejecutar cada tool call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolResults: any[] = [];
    for (const tc of toolCalls) {
      let argsObj: Record<string, string> = {};
      try {
        argsObj = JSON.parse(tc.arguments ?? "{}");
      } catch {
        argsObj = {};
      }

      // Inyectar el userId del usuario autenticado si la tool lo requiere
      if (!argsObj.userId) argsObj.userId = userId;

      const resultado = await ejecutarTool(tc.name, argsObj);
      toolResults.push({
        type: "function_call_output",
        call_id: tc.call_id,
        output: JSON.stringify(resultado),
      });
    }

    // Preparar siguiente iteración con el output anterior + resultados de tools
    currentInput = [...output, ...toolResults];
  }

  // Guardar la respuesta del asistente en BD
  if (respuestaFinal) {
    await prisma.chatMessage.create({
      data: {
        userId,
        sessionId,
        rol: "ASSISTANT" as RolMensaje,
        contenido: respuestaFinal,
      },
    });
  }

  return respuestaFinal;
}
