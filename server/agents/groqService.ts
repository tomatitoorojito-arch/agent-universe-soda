import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface GroqMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqService {
  /**
   * Plan a task using Groq (fast planning model)
   * Returns a detailed plan for executing the task
   */
  async planTask(
    taskDescription: string,
    projectContext: string = ""
  ): Promise<string> {
    const systemPrompt = `Eres un planificador experto de tareas. Tu rol es analizar solicitudes del usuario y crear un plan detallado y estructurado para completarlas.

${projectContext ? `Contexto del proyecto:\n${projectContext}\n` : ""}

Proporciona:
1. Un análisis breve de la tarea
2. Los pasos específicos a seguir (numerados y claros)
3. Herramientas o recursos necesarios
4. Tiempo estimado
5. Posibles desafíos y cómo abordarlos`;

    const messages: GroqMessage[] = [
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
      const response = await axios.post<GroqResponse>(GROQ_API_URL, {
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }, {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error en Groq Service:", error);
      throw new Error("Failed to plan task with Groq");
    }
  }

  /**
   * Generate a quick response for user queries
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: GroqMessage[] = []
  ): Promise<string> {
    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    try {
      const response = await axios.post<GroqResponse>(GROQ_API_URL, {
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }, {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error in Groq response generation:", error);
      throw new Error("Failed to generate response with Groq");
    }
  }
}

export const groqService = new GroqService();
