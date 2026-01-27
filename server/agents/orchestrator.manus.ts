import { manusService } from "./manusService";
import { browserController } from "./browserController";
import { webSearch } from "./webSearch";
import { dataAnalyzer } from "./dataAnalyzer";

/**
 * Orchestrator basado en Open Manus
 * Coordina todas las capacidades de Manus AI
 */

interface TaskExecutionResult {
  success: boolean;
  result?: string;
  error?: string;
  executedWith?: string;
  modelSelected?: string;
  toolsUsed?: string[];
  duration: number;
}

interface ExecutionOptions {
  projectContext?: string;
  retryOnFailure?: boolean;
  timeout?: number;
  forceModel?: string;
}

export class ManusOrchestrator {
  /**
   * Ejecutar tarea con Open Manus
   */
  async executeTask(
    taskDescription: string,
    options: ExecutionOptions = {}
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    const toolsUsed: string[] = [];

    try {
      console.log("🚀 [ManusOrchestrator] Ejecutando tarea:", taskDescription);

      // Detectar tipo de tarea
      const taskType = this.detectTaskType(taskDescription);
      console.log("📋 [ManusOrchestrator] Tipo de tarea detectado:", taskType);

      let result: string;

      switch (taskType) {
        case "image_generation":
          console.log("🎨 [ManusOrchestrator] Generando imagen con Manus...");
          result = await manusService.generateImage(taskDescription);
          toolsUsed.push("image_generation");
          break;

        case "video_generation":
          console.log("🎬 [ManusOrchestrator] Generando vídeo con Manus...");
          result = await manusService.generateVideo(taskDescription);
          toolsUsed.push("video_generation");
          break;

        case "web_search":
          console.log("🔍 [ManusOrchestrator] Buscando en la web...");
          const searchResult = await webSearch.search(taskDescription);
          result = JSON.stringify(searchResult);
          toolsUsed.push("web_search");
          break;

        case "data_analysis":
          console.log("📈 [ManusOrchestrator] Analizando datos...");
          result = await manusService.generateWithLLM([
            {
              role: "system",
              content: "Eres un experto en análisis de datos. Proporciona análisis profundo y perspicaz.",
            },
            {
              role: "user",
              content: taskDescription,
            },
          ]);
          toolsUsed.push("data_analysis");
          break;

        case "web_automation":
          console.log("🌐 [ManusOrchestrator] Automatizando web...");
          const browserResult = await browserController.navigate(taskDescription);
          result = JSON.stringify(browserResult);
          toolsUsed.push("web_automation");
          break;

        case "text_to_speech":
          console.log("🔊 [ManusOrchestrator] Generando audio...");
          result = await manusService.textToSpeech(taskDescription);
          toolsUsed.push("text_to_speech");
          break;

        case "ocr":
          console.log("📄 [ManusOrchestrator] Extrayendo texto de imagen...");
          result = await manusService.extractTextFromImage(taskDescription);
          toolsUsed.push("ocr");
          break;

        default:
          console.log("💬 [ManusOrchestrator] Usando LLM de Manus...");
          result = await manusService.generateWithLLM([
            {
              role: "system",
              content: `Eres AgentUniverse, un asistente de IA basado en Manus AI. Eres experto en múltiples áreas y puedes ayudar con cualquier tarea.${
                options.projectContext ? `\n\nContexto del proyecto:\n${options.projectContext}` : ""
              }`,
            },
            {
              role: "user",
              content: taskDescription,
            },
          ]);
          toolsUsed.push("llm");
      }

      const duration = Date.now() - startTime;

      console.log("✅ [ManusOrchestrator] Tarea completada exitosamente");

      return {
        success: true,
        result,
        executedWith: "Manus AI",
        modelSelected: "Manus (Claude 3.5 Sonnet)",
        toolsUsed,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error("❌ [ManusOrchestrator] Error fatal:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration,
        toolsUsed,
      };
    }
  }

  /**
   * Detectar tipo de tarea basado en el contenido
   */
  private detectTaskType(taskDescription: string): string {
    const lowerInput = taskDescription.toLowerCase();

    if (
      lowerInput.includes("imagen") ||
      lowerInput.includes("generar") ||
      lowerInput.includes("dibujar") ||
      lowerInput.includes("visual") ||
      lowerInput.includes("picture") ||
      lowerInput.includes("draw")
    ) {
      return "image_generation";
    }

    if (
      lowerInput.includes("vídeo") ||
      lowerInput.includes("video") ||
      lowerInput.includes("película") ||
      lowerInput.includes("film")
    ) {
      return "video_generation";
    }

    if (
      lowerInput.includes("buscar") ||
      lowerInput.includes("search") ||
      lowerInput.includes("internet") ||
      lowerInput.includes("información") ||
      lowerInput.includes("web")
    ) {
      return "web_search";
    }

    if (
      lowerInput.includes("datos") ||
      lowerInput.includes("csv") ||
      lowerInput.includes("analiz") ||
      lowerInput.includes("estadístic") ||
      lowerInput.includes("data") ||
      lowerInput.includes("analyze")
    ) {
      return "data_analysis";
    }

    if (
      lowerInput.includes("naveg") ||
      lowerInput.includes("click") ||
      lowerInput.includes("sitio") ||
      lowerInput.includes("navigate") ||
      lowerInput.includes("browse")
    ) {
      return "web_automation";
    }

    if (
      lowerInput.includes("audio") ||
      lowerInput.includes("voz") ||
      lowerInput.includes("habla") ||
      lowerInput.includes("speech") ||
      lowerInput.includes("voice")
    ) {
      return "text_to_speech";
    }

    if (
      lowerInput.includes("ocr") ||
      lowerInput.includes("texto") ||
      lowerInput.includes("imagen") ||
      lowerInput.includes("extract")
    ) {
      return "ocr";
    }

    return "general";
  }
}

export const manusOrchestrator = new ManusOrchestrator();
