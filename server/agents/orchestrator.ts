import { groqService } from "./groqService";
import { mistralService } from "./mistralService";
import { cerebrasService } from "./cerebrasService";
import { browserController } from "./browserController";
import { imageGenerator } from "./imageGenerator";
import { slidesGenerator } from "./slidesGenerator";
import { webSearch } from "./webSearch";
import { dataAnalyzer } from "./dataAnalyzer";
import { textToSpeech } from "./textToSpeech";
import { bytezService } from "./bytezService";
import { clawdbotService } from "./clawdbotService";
import { cloudBrowserService } from "./cloudBrowserService";
import { fileSystemService } from "./fileSystemService";
import { externalIntegrationService } from "./externalIntegrationService";

export interface TaskExecutionResult {
  success: boolean;
  plan?: string;
  result?: string;
  executedWith?: string;
  error?: string;
  duration?: number;
  toolsUsed?: string[];
}

export interface TaskExecutionOptions {
  projectContext?: string;
  retryOnFailure?: boolean;
  timeout?: number;
}

export interface ToolResult {
  tool: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: Date;
}

/**
 * SODA 4.0: Sistema de Orquestación Dinámica de Agentes
 * 
 * Características:
 * - Múltiples IAs trabajando en paralelo (Groq, Mistral, Cerebras, Bytez)
 * - Navegador autónomo en la nube
 * - Gestión completa de archivos
 * - Integraciones con Gmail, Drive, GitHub
 * - Auto-modificación de código
 * - Ejecución de comandos del sistema
 */
export class AgentOrchestrator {
  async executeTask(
    taskDescription: string,
    options: TaskExecutionOptions = {}
  ): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    const { projectContext = "", retryOnFailure = true, timeout = 300000 } = options;
    const toolsUsed: string[] = [];

    try {
      console.log("🤖 [AgentUniverse v1.4.0 SODA 4.0] Iniciando ejecución de tarea...");
      console.log(`📝 Descripción: ${taskDescription}`);

      // Detectar herramientas requeridas
      const requiredTools = this.detectRequiredTools(taskDescription);
      console.log(`🔧 Herramientas detectadas: ${requiredTools.join(", ")}`);

      // Paso 1: Planificación rápida con Groq
      console.log("📋 [Groq] Planificando pasos necesarios...");
      let plan: string;
      try {
        plan = await Promise.race([
          groqService.planTask(taskDescription, projectContext),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error("Groq timeout")), timeout / 3)
          ),
        ]);
        console.log("✅ [Groq] Plan generado exitosamente");
        toolsUsed.push("groq");
      } catch (error) {
        console.warn("⚠️ [Groq] Error en planificación, continuando sin plan específico");
        plan = taskDescription;
      }

      // Paso 2: Ejecutar herramientas detectadas
      let toolResults = "";
      for (const tool of requiredTools) {
        const result = await this.executeTool(tool, taskDescription);
        if (result.success) {
          toolResults += `\n${tool}: ${JSON.stringify(result.data)}`;
          toolsUsed.push(tool);
        } else {
          console.error(`❌ Error al ejecutar la herramienta ${tool}: ${result.error}`);
        }
      }

      // Paso 3: Ejecución principal con Mistral
      console.log("💪 [Mistral] Ejecutando tarea...");
      try {
        const fullPrompt = `${taskDescription}${toolResults ? `\n\nResultados de herramientas:\n${toolResults}` : ""}`;

        const result = await Promise.race([
          mistralService.executeTask(fullPrompt, plan),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error("Mistral timeout")), timeout / 2)
          ),
        ]);

        const duration = Date.now() - startTime;
        console.log("✅ [Mistral] Tarea completada exitosamente");

        return {
          success: true,
          plan,
          result,
          executedWith: "mistral",
          duration,
          toolsUsed,
        };
      } catch (mistralError) {
        console.error("❌ [Mistral] Error en ejecución:", mistralError);

        if (!retryOnFailure) throw mistralError;

        // Fallback a Cerebras
        console.log("🔄 [Cerebras] Intentando con modelo de respaldo...");
        try {
          const fallbackResult = await Promise.race([
            cerebrasService.executeTask(taskDescription, plan),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error("Cerebras timeout")), timeout / 2)
            ),
          ]);

          const duration = Date.now() - startTime;
          console.log("✅ [Cerebras] Tarea completada con modelo de respaldo");
          toolsUsed.push("cerebras");

          return {
            success: true,
            plan,
            result: fallbackResult,
            executedWith: "cerebras",
            duration,
            toolsUsed,
          };
        } catch (cerebrasError) {
          console.error("❌ [Cerebras] Error en respaldo:", cerebrasError);
          throw cerebrasError;
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error("❌ [AgentUniverse] Error fatal en ejecución:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration,
        toolsUsed,
      };
    }
  }

  private detectRequiredTools(taskDescription: string): string[] {
    const lowerCaseTask = taskDescription.toLowerCase();
    const tools: string[] = [];

    // Herramientas de navegación
    if (lowerCaseTask.includes("navega") || lowerCaseTask.includes("web") || lowerCaseTask.includes("extrae datos")) {
      tools.push("browser");
    }

    // Herramientas de generación
    if (lowerCaseTask.includes("genera imagen") || lowerCaseTask.includes("crea una foto")) {
      tools.push("image");
    }

    if (lowerCaseTask.includes("presentación") || lowerCaseTask.includes("ppt") || lowerCaseTask.includes("slides")) {
      tools.push("slides");
    }

    // Herramientas de búsqueda
    if (lowerCaseTask.includes("busca en internet") || lowerCaseTask.includes("investiga")) {
      tools.push("search");
    }

    // Herramientas de datos
    if (lowerCaseTask.includes("analiza datos") || lowerCaseTask.includes("csv") || lowerCaseTask.includes("excel")) {
      tools.push("data");
    }

    // Herramientas de audio
    if (lowerCaseTask.includes("texto a voz") || lowerCaseTask.includes("audio")) {
      tools.push("tts");
    }

    // Herramientas de Clawdbot
    if (lowerCaseTask.includes("ejecuta código") || lowerCaseTask.includes("corre script")) {
      tools.push("clawdbot_code");
    }

    if (lowerCaseTask.includes("crea issue en github") || lowerCaseTask.includes("reporta bug")) {
      tools.push("clawdbot_github");
    }

    // Herramientas de Cloud Browser
    if (lowerCaseTask.includes("navega por") || lowerCaseTask.includes("abre la web")) {
      tools.push("cloud_browser");
    }

    // Herramientas de archivos
    if (lowerCaseTask.includes("descarga") || lowerCaseTask.includes("sube archivo") || lowerCaseTask.includes("lee archivo")) {
      tools.push("file_system");
    }

    // Herramientas de integraciones
    if (lowerCaseTask.includes("envía correo") || lowerCaseTask.includes("gmail")) {
      tools.push("integration_email");
    }

    if (lowerCaseTask.includes("drive") || lowerCaseTask.includes("google drive")) {
      tools.push("integration_drive");
    }

    if (lowerCaseTask.includes("github") || lowerCaseTask.includes("repositorio")) {
      tools.push("integration_github");
    }

    return [...new Set(tools)];
  }

  private async executeTool(tool: string, taskDescription: string): Promise<ToolResult> {
    const timestamp = new Date();
    try {
      let data: unknown;

      switch (tool) {
        case "browser":
          console.log("🌐 [Tools] Ejecutando automatización web...");
          data = await browserController.navigateAndExtract(taskDescription);
          break;

        case "image":
          console.log("🖼️ [Tools] Generando imagen...");
          data = await imageGenerator.generateImage(taskDescription);
          break;

        case "slides":
          console.log("📊 [Tools] Generando presentación...");
          data = await slidesGenerator.generateSlides(taskDescription);
          break;

        case "search":
          console.log("🔍 [Tools] Buscando en internet...");
          data = await webSearch.search(taskDescription);
          break;

        case "data":
          console.log("📈 [Tools] Analizando datos...");
          data = await dataAnalyzer.analyze(taskDescription);
          break;

        case "tts":
          console.log("🔊 [Tools] Generando audio...");
          data = await textToSpeech.generate(taskDescription);
          break;

        case "clawdbot_code":
          console.log("💻 [Tools] Clawdbot: Ejecutando código...");
          data = await clawdbotService.executeCode(taskDescription);
          break;

        case "clawdbot_github":
          console.log("🐙 [Tools] Clawdbot: GitHub...");
          data = await clawdbotService.createGithubIssue(taskDescription);
          break;

        case "cloud_browser":
          console.log("🌐 [Tools] Cloud Browser: Navegando...");
          const session = await cloudBrowserService.startSession();
          data = await cloudBrowserService.navigate(taskDescription);
          break;

        case "file_system":
          console.log("📁 [Tools] File System: Gestión de archivos...");
          data = {
            workspace: fileSystemService.getWorkspacePath(),
            files: await fileSystemService.listFiles(),
          };
          break;

        case "integration_email":
          console.log("📧 [Tools] Integration: Gmail...");
          data = await externalIntegrationService.readEmails();
          break;

        case "integration_drive":
          console.log("📂 [Tools] Integration: Google Drive...");
          data = await externalIntegrationService.listGoogleDriveFiles();
          break;

        case "integration_github":
          console.log("🐙 [Tools] Integration: GitHub...");
          data = await externalIntegrationService.readGithubRepo("user", "repo");
          break;

        default:
          return {
            tool,
            success: false,
            error: `Herramienta no reconocida: ${tool}`,
            timestamp,
          };
      }

      return {
        tool,
        success: true,
        data,
        timestamp,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        tool,
        success: false,
        error: errorMessage,
        timestamp,
      };
    }
  }
}

export const agentOrchestrator = new AgentOrchestrator();
