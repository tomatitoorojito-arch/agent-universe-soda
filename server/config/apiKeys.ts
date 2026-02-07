/**
 * Configuración de API Keys para AgentUniverse
 * 
 * IMPORTANTE: No subir claves reales a GitHub.
 * Usa variables de entorno en el panel de Expo/EAS.
 */
export const API_KEYS = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || "TU_CLAVE_AQUI",
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "TU_CLAVE_AQUI",
  CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY || "TU_CLAVE_AQUI",
  BYTEZ_API_KEY: process.env.BYTEZ_API_KEY || "TU_CLAVE_AQUI",
  CLAWDBOT_API_KEY: process.env.CLAWDBOT_API_KEY || "TU_CLAVE_AQUI",
  REPLICATE_API_KEY: process.env.REPLICATE_API_KEY || "TU_CLAVE_AQUI",
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || "TU_CLAVE_AQUI",
  OPENCODE_API_KEY: process.env.OPENCODE_API_KEY || "TU_CLAVE_AQUI",
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "TU_CLAVE_AQUI",
  GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || "TU_CLAVE_AQUI",
  SKYVERN_API_KEY: process.env.SKYVERN_API_KEY || "TU_CLAVE_AQUI",
};

export const API_URLS = {
  GROQ: "https://api.groq.com/openai/v1",
  MISTRAL: "https://api.mistral.ai/v1",
  CEREBRAS: "https://api.cerebras.ai/v1",
  REPLICATE: "https://api.replicate.com/v1",
  TAVILY: "https://api.tavily.com",
  BYTEZ: "https://bytez.com/api",
  CLAWDBOT: "https://api.clawd.bot/v1",
  OPENCODE: "https://api.opencode.ai/v1",
  DEEPSEEK: "https://api.deepseek.com/v1",
  SKYVERN: "https://api.skyvern.com/v1",
};

export const MODEL_SELECTION = {
  planning: "groq",
  execution: "mistral",
  analysis: "mistral",
  creative: "mistral",
  search: "groq",
  fallback: "cerebras",
};

export const OPTIMAL_PARAMS = {
  groq: { temperature: 0.7, max_tokens: 2000, top_p: 0.9 },
  mistral: { temperature: 0.8, max_tokens: 4000, top_p: 0.95 },
  cerebras: { temperature: 0.7, max_tokens: 3000, top_p: 0.9 },
  image: { steps: 50, guidance_scale: 7.5, num_outputs: 1 },
  search: { max_results: 10, include_answer: true },
};
