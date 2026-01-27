import axios from "axios";
import { groqService } from "./groqService";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "VxvoWyq4rt8lfFzB2DbsCynV4xGKUulg";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface MistralMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class MistralService {
  /**
   * Execute a task using Mistral (powerful execution model)
   * Follows the plan provided by Groq and executes it with precision
   */
  async executeTask(
    taskDescription: string,
    plan: string
  ): Promise<string> {
    const systemPrompt = `Eres un ejecutor de tareas experto y preciso. Tu trabajo es seguir el plan proporcionado y ejecutar la tarea de manera meticulosa.

Plan a seguir:
${plan}

Proporciona:
1. Ejecución paso a paso detallada
2. Resultados concretos y verificables
3. Insights y recomendaciones importantes
4. Próximos pasos (si aplica)
5. Cualquier limitación encontrada`;

    const messages: MistralMessage[] = [
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
      console.log("💪 [Mistral] Ejecutando tarea...");
      
      const response = await axios.post<MistralResponse>(
        MISTRAL_API_URL,
        {
          model: "mistral-large-latest",
          messages,
          temperature: 0.8,
          max_tokens: 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Mistral] Tarea ejecutada exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Mistral] Error en ejecución:", error);
      
      // Fallback a Groq
      console.log("🔄 [Mistral] Fallback a Groq...");
      try {
        return await groqService.generateResponse(taskDescription);
      } catch (groqError) {
        throw new Error("Failed to execute task with Mistral and Groq fallback");
      }
    }
  }

  /**
   * Generate content with Mistral
   */
  async generateContent(
    contentType: string,
    requirements: string
  ): Promise<string> {
    const systemPrompt = `Eres un experto en generación de contenido. Tu tarea es crear contenido de alta calidad según los requisitos proporcionados.

Tipo de contenido: ${contentType}

Proporciona contenido que sea:
1. Relevante y preciso
2. Bien estructurado
3. Atractivo y profesional
4. Optimizado para el propósito`;

    const messages: MistralMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: requirements,
      },
    ];

    try {
      console.log("💪 [Mistral] Generando contenido...");
      
      const response = await axios.post<MistralResponse>(
        MISTRAL_API_URL,
        {
          model: "mistral-large-latest",
          messages,
          temperature: 0.8,
          max_tokens: 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Mistral] Contenido generado exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Mistral] Error en generación:", error);
      
      // Fallback a Groq
      console.log("🔄 [Mistral] Fallback a Groq...");
      try {
        return await groqService.generateResponse(requirements);
      } catch (groqError) {
        throw new Error("Failed to generate content with Mistral and Groq fallback");
      }
    }
  }

  /**
   * Analyze data with Mistral
   */
  async analyzeData(
    dataDescription: string,
    analysisType: string = "general"
  ): Promise<string> {
    const systemPrompt = `Eres un experto en análisis de datos. Tu tarea es proporcionar un análisis profundo y perspicaz de los datos proporcionados.

Tipo de análisis: ${analysisType}

Proporciona:
1. Análisis detallado
2. Patrones identificados
3. Insights clave
4. Recomendaciones basadas en datos`;

    const messages: MistralMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: dataDescription,
      },
    ];

    try {
      console.log("💪 [Mistral] Analizando datos...");
      
      const response = await axios.post<MistralResponse>(
        MISTRAL_API_URL,
        {
          model: "mistral-large-latest",
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Mistral] Análisis completado exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Mistral] Error en análisis:", error);
      
      // Fallback a Groq
      console.log("🔄 [Mistral] Fallback a Groq...");
      try {
        return await groqService.generateResponse(dataDescription);
      } catch (groqError) {
        throw new Error("Failed to analyze data with Mistral and Groq fallback");
      }
    }
  }

  /**
   * Generate a response with Mistral
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: MistralMessage[] = []
  ): Promise<string> {
    const messages: MistralMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    try {
      console.log("💪 [Mistral] Generando respuesta...");
      
      const response = await axios.post<MistralResponse>(
        MISTRAL_API_URL,
        {
          model: "mistral-large-latest",
          messages,
          temperature: 0.8,
          max_tokens: 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Mistral] Respuesta generada exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Mistral] Error en generación:", error);
      
      // Fallback a Groq
      console.log("🔄 [Mistral] Fallback a Groq...");
      try {
        return await groqService.generateResponse(userMessage);
      } catch (groqError) {
        throw new Error("Failed to generate response with Mistral and Groq fallback");
      }
    }
  }
}

export const mistralService = new MistralService();
