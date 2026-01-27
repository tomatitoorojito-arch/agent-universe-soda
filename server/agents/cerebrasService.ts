import axios from "axios";
import { groqService } from "./groqService";

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || "csk-ct85npyyj5nxtm6dedtxxvdfwxmex32k2459wptn5djecd96";
const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";

interface CerebrasMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface CerebrasResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class CerebrasService {
  /**
   * Execute a task using Cerebras (fallback powerful model)
   * Used when Mistral fails or is unavailable
   */
  async executeTask(
    taskDescription: string,
    plan?: string
  ): Promise<string> {
    const systemPrompt = `Eres un ejecutor de tareas experto. Tu trabajo es ejecutar la tarea proporcionada de manera precisa y efectiva.

${plan ? `Plan a seguir:\n${plan}\n` : ""}

Proporciona:
1. Ejecución detallada
2. Resultados concretos
3. Insights valiosos
4. Próximos pasos si es necesario`;

    const messages: CerebrasMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: taskDescription,
      },
    ];

    try {
      console.log("🧠 [Cerebras] Intentando ejecutar tarea...");
      
      const response = await axios.post<CerebrasResponse>(
        CEREBRAS_API_URL,
        {
          model: "llama-3.1-70b",
          messages,
          temperature: 0.3,
          max_tokens: 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${CEREBRAS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Cerebras] Tarea ejecutada exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Cerebras] Error en ejecución:", error);
      
      // Fallback a Groq
      console.log("🔄 [Cerebras] Fallback a Groq...");
      try {
        return await groqService.generateResponse(taskDescription);
      } catch (groqError) {
        throw new Error("Failed to execute task with Cerebras and Groq fallback");
      }
    }
  }

  /**
   * Generate a response with Cerebras
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: CerebrasMessage[] = []
  ): Promise<string> {
    const messages: CerebrasMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    try {
      console.log("🧠 [Cerebras] Generando respuesta...");
      
      const response = await axios.post<CerebrasResponse>(
        CEREBRAS_API_URL,
        {
          model: "llama-3.1-70b",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${CEREBRAS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Cerebras] Respuesta generada exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Cerebras] Error en generación:", error);
      
      // Fallback a Groq
      console.log("🔄 [Cerebras] Fallback a Groq...");
      try {
        return await groqService.generateResponse(userMessage);
      } catch (groqError) {
        throw new Error("Failed to generate response with Cerebras and Groq fallback");
      }
    }
  }

  /**
   * Process and summarize large documents
   */
  async summarizeDocument(
    documentContent: string,
    summaryType: string = "general"
  ): Promise<string> {
    const systemPrompt = `Eres un experto en resumir documentos. Tu tarea es crear un resumen claro y conciso del documento proporcionado.

Tipo de resumen: ${summaryType}

Proporciona:
1. Resumen ejecutivo
2. Puntos clave
3. Conclusiones
4. Recomendaciones si aplica`;

    const messages: CerebrasMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: documentContent,
      },
    ];

    try {
      console.log("🧠 [Cerebras] Resumiendo documento...");
      
      const response = await axios.post<CerebrasResponse>(
        CEREBRAS_API_URL,
        {
          model: "llama-3.1-70b",
          messages,
          temperature: 0.5,
          max_tokens: 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${CEREBRAS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Cerebras] Documento resumido exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Cerebras] Error en resumen:", error);
      
      // Fallback a Groq
      console.log("🔄 [Cerebras] Fallback a Groq...");
      try {
        return await groqService.generateResponse(documentContent);
      } catch (groqError) {
        throw new Error("Failed to summarize document with Cerebras and Groq fallback");
      }
    }
  }
}

export const cerebrasService = new CerebrasService();
