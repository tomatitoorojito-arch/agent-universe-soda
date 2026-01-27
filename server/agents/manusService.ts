import axios from "axios";
// FormData es nativo en Node.js 18+

/**
 * Servicio de integración con Open Manus API
 * Proporciona acceso a todas las capacidades de Manus AI
 */

const MANUS_API_URL = process.env.BUILT_IN_FORGE_API_URL || "https://api.manus.im";
const MANUS_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

interface ManusLLMRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ManusLLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ManusImageRequest {
  prompt: string;
  size?: string;
  quality?: string;
  n?: number;
}

interface ManusImageResponse {
  data: Array<{
    url: string;
  }>;
}

interface ManusVideoRequest {
  prompt: string;
  duration?: number;
  quality?: string;
}

interface ManusVideoResponse {
  data: {
    url: string;
    duration: number;
  };
}

export class ManusService {
  /**
   * Usar LLM de Manus AI
   */
  async generateWithLLM(
    messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }>,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<string> {
    try {
      console.log("🚀 [Manus] Usando LLM de Manus AI...");

      const response = await axios.post<ManusLLMResponse>(
        `${MANUS_API_URL}/llm/chat/completions`,
        {
          messages,
          model: options?.model || "claude-3-5-sonnet",
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      console.log("✅ [Manus] LLM completado exitosamente");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("❌ [Manus] Error en LLM:", error);
      throw new Error("Failed to generate with Manus LLM");
    }
  }

  /**
   * Generar imagen con Manus AI
   */
  async generateImage(
    prompt: string,
    options?: {
      size?: string;
      quality?: string;
      n?: number;
    }
  ): Promise<string> {
    try {
      console.log("🎨 [Manus] Generando imagen...");

      const response = await axios.post<ManusImageResponse>(
        `${MANUS_API_URL}/image/generate`,
        {
          prompt,
          size: options?.size || "1024x1024",
          quality: options?.quality || "hd",
          n: options?.n || 1,
        },
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );

      console.log("✅ [Manus] Imagen generada exitosamente");
      return response.data.data[0].url;
    } catch (error) {
      console.error("❌ [Manus] Error en generación de imagen:", error);
      throw new Error("Failed to generate image with Manus");
    }
  }

  /**
   * Generar vídeo con Manus AI
   */
  async generateVideo(
    prompt: string,
    options?: {
      duration?: number;
      quality?: string;
    }
  ): Promise<string> {
    try {
      console.log("🎬 [Manus] Generando vídeo...");

      const response = await axios.post<ManusVideoResponse>(
        `${MANUS_API_URL}/video/generate`,
        {
          prompt,
          duration: options?.duration || 10,
          quality: options?.quality || "hd",
        },
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 300000,
        }
      );

      console.log("✅ [Manus] Vídeo generado exitosamente");
      return response.data.data.url;
    } catch (error) {
      console.error("❌ [Manus] Error en generación de vídeo:", error);
      throw new Error("Failed to generate video with Manus");
    }
  }

  /**
   * Usar Data API de Manus
   */
  async searchData(query: string): Promise<string> {
    try {
      console.log("🔍 [Manus] Buscando datos...");

      const response = await axios.post(
        `${MANUS_API_URL}/data/search`,
        {
          query,
          limit: 10,
        },
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Manus] Búsqueda completada exitosamente");
      return JSON.stringify(response.data);
    } catch (error) {
      console.error("❌ [Manus] Error en búsqueda de datos:", error);
      throw new Error("Failed to search data with Manus");
    }
  }

  /**
   * Usar Notification API de Manus
   */
  async sendNotification(title: string, content: string): Promise<boolean> {
    try {
      console.log("📢 [Manus] Enviando notificación...");

      await axios.post(
        `${MANUS_API_URL}/notification/send`,
        {
          title,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("✅ [Manus] Notificación enviada exitosamente");
      return true;
    } catch (error) {
      console.error("❌ [Manus] Error en notificación:", error);
      return false;
    }
  }

  /**
   * Usar Storage API de Manus
   */
  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    mimeType: string
  ): Promise<string> {
    try {
      console.log("📁 [Manus] Subiendo archivo...");

      const formData = new FormData();
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
      formData.append("file", blob, filename);

      const response = await axios.post(
        `${MANUS_API_URL}/storage/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
          },
          timeout: 60000,
        }
      );

      console.log("✅ [Manus] Archivo subido exitosamente");
      return response.data.url;
    } catch (error) {
      console.error("❌ [Manus] Error en carga de archivo:", error);
      throw new Error("Failed to upload file with Manus");
    }
  }

  /**
   * Usar Speech API de Manus
   */
  async textToSpeech(text: string, language: string = "es"): Promise<string> {
    try {
      console.log("🔊 [Manus] Generando audio...");

      const response = await axios.post(
        `${MANUS_API_URL}/speech/generate`,
        {
          text,
          language,
          voice: "natural",
        },
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      console.log("✅ [Manus] Audio generado exitosamente");
      return response.data.url;
    } catch (error) {
      console.error("❌ [Manus] Error en generación de audio:", error);
      throw new Error("Failed to generate speech with Manus");
    }
  }

  /**
   * Usar OCR API de Manus
   */
  async extractTextFromImage(imageUrl: string): Promise<string> {
    try {
      console.log("📄 [Manus] Extrayendo texto de imagen...");

      const response = await axios.post(
        `${MANUS_API_URL}/ocr/extract`,
        {
          image_url: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${MANUS_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ [Manus] Texto extraído exitosamente");
      return response.data.text;
    } catch (error) {
      console.error("❌ [Manus] Error en OCR:", error);
      throw new Error("Failed to extract text with Manus OCR");
    }
  }
}

export const manusService = new ManusService();
