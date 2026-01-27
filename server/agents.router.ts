import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { manusOrchestrator } from "./agents/orchestrator.manus";

/**
 * Router de Agentes - Interfaz principal para AgentUniverse
 * Basado en Open Manus AI - Todas las capacidades integradas
 */
export const agentsRouter = router({
  /**
   * Ejecutar una tarea con Open Manus
   * Selección automática de herramientas según el tipo de tarea
   */
  executeTask: publicProcedure
    .input(
      z.object({
        description: z.string().min(1, "La descripción de la tarea es requerida"),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("📋 [Router] Ejecutando tarea con Manus:", input.description);

        const result = await manusOrchestrator.executeTask(input.description, {
          projectContext: input.context,
          retryOnFailure: true,
          timeout: 300000,
        });

        if (!result.success) {
          return {
            success: false,
            error: result.error || "Error desconocido",
          };
        }

        return {
          success: true,
          result: result.result,
          executedWith: result.executedWith,
          modelSelected: result.modelSelected,
          toolsUsed: result.toolsUsed || [],
          duration: result.duration,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("❌ [Router] Error:", errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }
    }),

  /**
   * Generar imagen con Manus AI
   */
  generateImage: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "El prompt es requerido"),
        style: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("🎨 [Router] Generando imagen con Manus:", input.prompt);

        const result = await manusOrchestrator.executeTask(
          `Generar una imagen con el siguiente prompt: ${input.prompt}${input.style ? ` Estilo: ${input.style}` : ""}`,
          {
            retryOnFailure: true,
          }
        );

        return {
          success: result.success,
          result: result.result,
          error: result.error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: errorMessage,
        };
      }
    }),

  /**
   * Generar vídeo con Manus AI
   */
  generateVideo: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "El prompt es requerido"),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("🎬 [Router] Generando vídeo con Manus:", input.prompt);

        const result = await manusOrchestrator.executeTask(
          `Generar un vídeo con el siguiente prompt: ${input.prompt}${input.duration ? ` Duración: ${input.duration} segundos` : ""}`,
          {
            retryOnFailure: true,
          }
        );

        return {
          success: result.success,
          result: result.result,
          error: result.error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: errorMessage,
        };
      }
    }),

  /**
   * Buscar información en la web
   */
  searchWeb: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, "La búsqueda es requerida"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("🔍 [Router] Buscando:", input.query);

        const result = await manusOrchestrator.executeTask(
          `Buscar información sobre: ${input.query}`,
          {
            retryOnFailure: true,
          }
        );

        return {
          success: result.success,
          result: result.result,
          error: result.error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: errorMessage,
        };
      }
    }),

  /**
   * Analizar datos
   */
  analyzeData: publicProcedure
    .input(
      z.object({
        data: z.string().min(1, "Los datos son requeridos"),
        analysisType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("📈 [Router] Analizando datos");

        const result = await manusOrchestrator.executeTask(
          `Analizar los siguientes datos${input.analysisType ? ` (${input.analysisType})` : ""}:\n${input.data}`,
          {
            retryOnFailure: true,
          }
        );

        return {
          success: result.success,
          result: result.result,
          error: result.error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: errorMessage,
        };
      }
    }),

  /**
   * Síntesis de voz
   */
  textToSpeech: publicProcedure
    .input(
      z.object({
        text: z.string().min(1, "El texto es requerido"),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("🔊 [Router] Generando audio");

        const result = await manusOrchestrator.executeTask(
          `Convertir el siguiente texto a audio${input.language ? ` en ${input.language}` : ""}:\n${input.text}`,
          {
            retryOnFailure: true,
          }
        );

        return {
          success: result.success,
          result: result.result,
          error: result.error,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          error: errorMessage,
        };
      }
    }),

  /**
   * Obtener estado del sistema
   */
  getStatus: publicProcedure.query(async () => {
    return {
      status: "online",
      version: "2.0.0",
      platform: "Manus AI",
      features: [
        "Task Execution",
        "Image Generation",
        "Video Generation",
        "Web Search",
        "Data Analysis",
        "Text-to-Speech",
        "OCR",
        "File Storage",
      ],
      models: ["Claude 3.5 Sonnet", "Manus LLM"],
      timestamp: new Date(),
    };
  }),
});

export type AgentsRouter = typeof agentsRouter;
