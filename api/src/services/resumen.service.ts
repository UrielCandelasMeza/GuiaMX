import client from "../lib/azure";

const MODEL = "gpt-4.1-mini";

const SYSTEM_PROMPT = `Genera un resumen conciso en español de la siguiente conversación entre un usuario y un asistente de trámites gubernamentales mexicanos.
El resumen debe capturar: qué trámite se discutió, qué documentos se mencionaron, qué pasos se completaron y qué quedó pendiente.
Máximo 200 palabras.`;

/**
 * Genera un resumen de la conversación usando el LLM de Azure OpenAI.
 * @param mensajes Lista de mensajes con rol y contenido
 * @returns Resumen en texto plano
 */
export async function generarResumen(
  mensajes: { rol: string; contenido: string }[],
): Promise<string> {
  if (mensajes.length === 0) return "Sin mensajes en esta sesión.";

  // Formatear la conversación como texto plano para el LLM
  const conversacion = mensajes
    .map((m) => `${m.rol === "USER" ? "Usuario" : "Asistente"}: ${m.contenido}`)
    .join("\n");

  const response = await client.responses.create({
    model: MODEL,
    instructions: SYSTEM_PROMPT,
    input: conversacion,
  });

  // Extraer el texto de la respuesta del modelo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const texto = (response.output as any[])
    .filter((o) => o.type === "message")
    .flatMap((o) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (o.content as any[])
        .filter((c) => c.type === "output_text")
        .map((c) => c.text as string),
    )
    .join("");

  return texto.trim() || "No se pudo generar el resumen.";
}
