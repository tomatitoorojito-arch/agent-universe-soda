import axios from "axios";

/**
 * Servicio de Skyvern AI
 * Navegador inteligente para automatización web compleja
 * Utiliza IA para entender y ejecutar tareas en sitios web
 */

const SKYVERN_API_URL = "https://api.skyvern.com/v1";
const SKYVERN_API_KEY = process.env.SKYVERN_API_KEY || "";

export interface SkyvernTask {
  url: string;
  objective: string;
  navigationGoal?: string;
  dataToExtract?: string[];
}

export interface SkyvernResult {
  success: boolean;
  taskId?: string;
  result?: Record<string, unknown>;
  extractedData?: Record<string, unknown>;
  error?: string;
  timestamp: Date;
}

class SkyvernService {
  private apiKey: string;

  constructor() {
    this.apiKey = SKYVERN_API_KEY;
    if (!this.apiKey) {
      console.warn("⚠️  [Skyvern] SKYVERN_API_KEY no configurada");
    }
  }

  /**
   * Ejecuta una tarea de navegación con Skyvern
   */
  async executeTask(task: SkyvernTask): Promise<SkyvernResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "SKYVERN_API_KEY no configurada",
          timestamp: new Date(),
        };
      }

      console.log(`🤖 [Skyvern] Ejecutando tarea: ${task.objective}`);

      const response = await axios.post(
        `${SKYVERN_API_URL}/tasks`,
        {
          url: task.url,
          objective: task.objective,
          navigation_goal: task.navigationGoal,
          data_to_extract: task.dataToExtract,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 120000,
        }
      );

      console.log(`✅ [Skyvern] Tarea ejecutada exitosamente`);

      return {
        success: true,
        taskId: response.data.task_id,
        result: response.data.result,
        extractedData: response.data.extracted_data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Skyvern] Error:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Navega a una URL y extrae información específica
   */
  async navigateAndExtract(url: string, objective: string, fieldsToExtract?: string[]): Promise<SkyvernResult> {
    try {
      console.log(`🌐 [Skyvern] Navegando a ${url} con objetivo: ${objective}`);

      const task: SkyvernTask = {
        url,
        objective,
        dataToExtract: fieldsToExtract,
      };

      return await this.executeTask(task);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Skyvern] Error en navegación:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Realiza una búsqueda en un sitio web
   */
  async search(url: string, searchQuery: string): Promise<SkyvernResult> {
    try {
      console.log(`🔍 [Skyvern] Buscando "${searchQuery}" en ${url}`);

      const task: SkyvernTask = {
        url,
        objective: `Busca "${searchQuery}" en este sitio web y extrae los resultados más relevantes`,
        navigationGoal: `Completar una búsqueda por "${searchQuery}"`,
      };

      return await this.executeTask(task);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Skyvern] Error en búsqueda:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Completa un formulario en un sitio web
   */
  async fillForm(url: string, formData: Record<string, string>): Promise<SkyvernResult> {
    try {
      console.log(`📝 [Skyvern] Completando formulario en ${url}`);

      const objective = `Completa el formulario con los siguientes datos: ${JSON.stringify(formData)}`;

      const task: SkyvernTask = {
        url,
        objective,
        navigationGoal: "Completar y enviar un formulario",
      };

      return await this.executeTask(task);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Skyvern] Error en formulario:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Obtiene el estado de una tarea
   */
  async getTaskStatus(taskId: string): Promise<SkyvernResult> {
    try {
      console.log(`📊 [Skyvern] Obteniendo estado de tarea: ${taskId}`);

      if (!this.apiKey) {
        return {
          success: false,
          error: "SKYVERN_API_KEY no configurada",
          timestamp: new Date(),
        };
      }

      const response = await axios.get(
        `${SKYVERN_API_URL}/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log(`✅ [Skyvern] Estado obtenido`);

      return {
        success: true,
        taskId,
        result: response.data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Skyvern] Error al obtener estado:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}

export const skyvernService = new SkyvernService();
