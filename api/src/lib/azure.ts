import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { OpenAI } from "openai";

const PROJECT_ENDPOINT = process.env.PROJECT_ENDPOINT ?? "";
const API_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";

// Azure OpenAI endpoint structure: https://<resource>.openai.azure.com/openai/v1/
// Si el endpoint ya termina en / lo usamos como base y agregamos 'openai/v1/'
// Si ya contiene 'openai/v1', lo usamos tal cual
function buildBaseURL(endpoint: string): string {
  if (!endpoint) return "";
  const base = endpoint.endsWith("/") ? endpoint : endpoint + "/";
  if (base.includes("openai/v1")) return base;
  return base + "openai/v1/";
}

const client = new OpenAI({
  baseURL: buildBaseURL(PROJECT_ENDPOINT),
  apiKey: API_KEY,
  defaultHeaders: {
    "api-key": API_KEY,
  },
});

const tokenProvider = getBearerTokenProvider(
  new DefaultAzureCredential(),
  "https://ai.azure.com/.default",
);

export default client;
