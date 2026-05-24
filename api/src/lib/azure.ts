import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { OpenAI } from "openai";

const PROJECT_ENDPOINT = `${process.env.PROJECT_ENDPOINT}/openai/v1/`;
const API_KEY = process.env.AZURE_OPENAI_API_KEY ?? ""; // Tu "Clave 1"

const client = new OpenAI({
  baseURL: PROJECT_ENDPOINT,
  apiKey: API_KEY,
});

const tokenProvider = getBearerTokenProvider(
  new DefaultAzureCredential(),
  "https://ai.azure.com/.default",
);

export default client;
