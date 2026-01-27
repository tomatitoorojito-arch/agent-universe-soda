import { groqService } from "./groqService";
import { mistralService } from "./mistralService";
import { cerebrasService } from "./cerebrasService";
import { browserController } from "./browserController";
import { imageGenerator } from "./imageGenerator";
import { slidesGenerator } from "./slidesGenerator";
import { webSearch } from "./webSearch";
import { dataAnalyzer } from "./dataAnalyzer";
import { textToSpeech } from "./textToSpeech";
import { API_KEYS, MODEL_SELECTION, OPTIMAL_PARAMS, logConfiguration } from "../config/apiKeys";

export interface TaskExecutionResult {
  success: boolean;
  plan?: string;
  result?: string;
  executedWith?: "groq" | "mistral" | "cerebras";
  error?: string;
  duration?: number;
  toolsUsed?: string[];
  modelSelected?: string;
}

export interface TaskExecutionOptions {
  projectContext?: string;
  retryOnFailure?: boolean;
  timeout?: number;
  forceModel?: "groq" | "mistral" | "cerebras";
}

/**
 * Agent Orchestrator Mejorado
 * - Selección automática de modelos por tarea
 * - Máxima potencia en cada operación
 * - Todas las API Keys integradas
 * - Sin intervención del usuario
 */
export class AgentOrchestratorImproved {
  constructor() {
    logConfiguration();
  }

  /**
   * Detectar el tipo de tarea
   */
  private detectTaskType(description: string): string {
    const lowerDesc = description.toLowerCase();

    if (
      lowerDesc.includes("plan") ||
      lowerDesc.includes("organiz") ||
      lowerDesc.includes("estructura")
    ) {
      return "planning";
    }

    if (
      lowerDesc.includes("analiz") ||
      lowerDesc.includes("estadístic") ||
      lowerDesc.includes("datos")
    ) {
      return "analysis";
    }

    if (
      lowerDesc.includes("crear") ||
      lowerDesc.includes("generar") ||
      lowerDesc.includes("escribir") ||
      lowerDesc.includes("cuento") ||
      lowerDesc.includes("poema")
    ) {
      return "creative";
    }

    if (
      lowerDesc.includes("buscar") ||
      lowerDesc.includes("información") ||
      lowerDesc.includes("internet")
    ) {
      return "search";
    }

    return "execution";
  }

  /**
   * Seleccionar el mejor modelo para la tarea
   */
  private selectBestModel(taskType: string, forceModel?: string): "groq" | "mistral" | "cerebras" {
    if (forceModel && (forceModel === "groq" || forceModel === "mistral" || forceModel === "cerebras")) {
      return forceModel;
    }

    const modelMap: Record<string, "groq" | "mistral" | "cerebras"> = {
      planning: "groq",
      analysis: "mistral",
      creative: "mistral",
      search: "groq",
      execution: "mistral",
    };

    return modelMap[taskType] || "mistral";
  }

  /**
   * Ejecutar tarea con máxima potencia
   */
  async executeTask(
    taskDescription: string,
    options: TaskExecutionOptions = {}
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    const { projectContext = "", retryOnFailure = true, timeout = 300000, forceModel } = options;

    const toolsUsed: string[] = [];

    try {
      console.log("🤖 [AgentUniverse] Iniciando ejecución de tarea...");
      console.log(`📝 Descripción: ${taskDescription}`);

      // Detectar tipo de tarea
      const taskType = this.detectTaskType(taskDescription);
      console.log(`🎯 Tipo de tarea detectado: ${taskType}`);

      // Seleccionar mejor modelo
      const selectedModel = this.selectBestModel(taskType, forceModel);
      console.log(`🧠 Modelo seleccionado: ${selectedModel}`);

      // Detectar herramientas necesarias
      const requiredTools = this.detectRequiredTools(taskDescription);
      console.log(`🔧 Herramientas detectadas: ${requiredTools.join(", ")}`);

      // Ejecutar herramientas en paralelo
      let toolResults = "";
      if (requiredTools.length > 0) {
        const toolPromises = requiredTools.map((tool) => this.executeTool(tool, taskDescription));
        const toolResultsArray = await Promise.allSettled(toolPromises);

        toolResultsArray.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value.success) {
            toolResults += `\n${requiredTools[index]}: ${JSON.stringify(result.value.data)}`;
            toolsUsed.push(requiredTools[index]);
          }
        });
      }

      // Ejecutar con modelo seleccionado
      const fullPrompt = `${taskDescription}${toolResults ? `\n\nResultados de herramientas:\n${toolResults}` : ""}`;

      let result: string;
      let executedWith: "groq" | "mistral" | "cerebras" = selectedModel;

      try {
        console.log(`💪 [${selectedModel.toUpperCase()}] Ejecutando tarea...`);

        result = await Promise.race([
          this.executeWithModel(selectedModel, fullPrompt, projectContext),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error(`${selectedModel} timeout`)), timeout)
          ),
        ]);

        console.log(`✅ [${selectedModel.toUpperCase()}] Tarea completada exitosamente`);
      } catch (error) {
        console.error(`❌ [${selectedModel.toUpperCase()}] Error:`, error);

        if (!retryOnFailure) {
          throw error;
        }

        // Intentar con modelo de respaldo
        const fallbackModel = MODEL_SELECTION.fallback as "groq" | "mistral" | "cerebras";
        console.log(`🔄 [${fallbackModel.toUpperCase()}] Intentando con modelo de respaldo...`);

        try {
          result = await Promise.race([
            this.executeWithModel(fallbackModel, fullPrompt, projectContext),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error(`${fallbackModel} timeout`)), timeout / 2)
            ),
          ]);

          executedWith = fallbackModel;
          console.log(`✅ [${fallbackModel.toUpperCase()}] Tarea completada con respaldo`);
        } catch (fallbackError) {
          console.error(`❌ [${fallbackModel.toUpperCase()}] Error en respaldo:`, fallbackError);
          throw fallbackError;
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        result,
        executedWith,
        duration,
        toolsUsed,
        modelSelected: selectedModel,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error("❌ [AgentUniverse] Error fatal:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration,
        toolsUsed,
      };
    }
  }

  /**
   * Ejecutar con modelo específico
   */
  private async executeWithModel(
    model: "groq" | "mistral" | "cerebras",
    prompt: string,
    context: string
  ): Promise<string> {
    const params = OPTIMAL_PARAMS[model];

    switch (model) {
      case "groq":
        return groqService.generateResponse(prompt);
      case "mistral":
        return mistralService.generateContent("general", prompt);
      case "cerebras":
        return cerebrasService.generateResponse(prompt);
      default:
        throw new Error(`Modelo desconocido: ${model}`);
    }
  }

  /**
   * Detectar herramientas necesarias
   */
  private detectRequiredTools(description: string): string[] {
    const tools: string[] = [];
    const lowerDesc = description.toLowerCase();

    if (
      lowerDesc.includes("naveg") ||
      lowerDesc.includes("web") ||
      lowerDesc.includes("sitio") ||
      lowerDesc.includes("página")
    ) {
      tools.push("browser");
    }

    if (
      lowerDesc.includes("imagen") ||
      lowerDesc.includes("generar") ||
      lowerDesc.includes("dibujar") ||
      lowerDesc.includes("visual")
    ) {
      tools.push("image");
    }

    if (
      lowerDesc.includes("presentación") ||
      lowerDesc.includes("pptx") ||
      lowerDesc.includes("diapositiva")
    ) {
      tools.push("slides");
    }

    if (
      lowerDesc.includes("buscar") ||
      lowerDesc.includes("internet") ||
      lowerDesc.includes("información")
    ) {
      tools.push("search");
    }

    if (
      lowerDesc.includes("datos") ||
      lowerDesc.includes("csv") ||
      lowerDesc.includes("análisis") ||
      lowerDesc.includes("estadística")
    ) {
      tools.push("data");
    }

    if (
      lowerDesc.includes("audio") ||
      lowerDesc.includes("voz") ||
      lowerDesc.includes("habla")
    ) {
      tools.push("tts");
    }

    return tools;
  }

  /**
   * Ejecutar herramienta específica
   */
  private async executeTool(tool: string, description: string): Promise<any> {
    try {
      switch (tool) {
        case "browser":
          console.log("🌐 [Tools] Ejecutando automatización web...");
          await browserController.initialize();
          const page = await browserController.createPage();
          const result = await browserController.navigate("https://www.google.com");
          await browserController.close();
          return { success: result.success, data: result.data };

        case "image":
          console.log("🎨 [Tools] Ejecutando generación de imágenes...");
          const imageResult = await imageGenerator.generateImage(description);
          return { success: imageResult.success, data: imageResult };

        case "slides":
          console.log("📊 [Tools] Ejecutando generación de presentaciones...");
          const slidesResult = await slidesGenerator.generateFromMarkdown("Presentación", description);
          return { success: slidesResult.success, data: slidesResult };

        case "search":
          console.log("🔍 [Tools] Ejecutando búsqueda web...");
          const searchResult = await webSearch.searchAndSummarize(description);
          return { success: searchResult.success, data: searchResult };

        case "data":
          console.log("📈 [Tools] Ejecutando análisis de datos...");
          return { success: true, data: { message: "Análisis de datos disponible" } };

        case "tts":
          console.log("🔊 [Tools] Ejecutando síntesis de voz...");
          const ttsResult = await textToSpeech.synthesize(description);
          return { success: ttsResult.success, data: ttsResult };

        default:
          return { success: false, error: `Herramienta desconocida: ${tool}` };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ [Tools] Error en ${tool}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

export const orchestratorImproved = new AgentOrchestratorImproved();
