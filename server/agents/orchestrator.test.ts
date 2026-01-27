import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { orchestrator } from "./orchestrator";
import * as groqModule from "./groqService";
import * as mistralModule from "./mistralService";
import * as cerebrasModule from "./cerebrasService";

// Mock the services
vi.mock("./groqService");
vi.mock("./mistralService");
vi.mock("./cerebrasService");

describe("AgentOrchestrator", () => {
  beforeAll(() => {
    // Setup environment variables for testing
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.MISTRAL_API_KEY = "test-mistral-key";
    process.env.CEREBRAS_API_KEY = "test-cerebras-key";
  });

  describe("executeTask", () => {
    it("should execute task successfully with Mistral after Groq planning", async () => {
      // Mock Groq planning
      vi.spyOn(groqModule.groqService, "planTask").mockResolvedValue(
        "Step 1: Analyze\nStep 2: Execute\nStep 3: Report"
      );

      // Mock Mistral execution
      vi.spyOn(mistralModule.mistralService, "executeTask").mockResolvedValue(
        "Task completed successfully with results"
      );

      const result = await orchestrator.executeTask("Test task description");

      expect(result.success).toBe(true);
      expect(result.executedWith).toBe("mistral");
      expect(result.result).toContain("Task completed");
      expect(result.duration).toBeGreaterThan(0);
    });

    it("should fallback to Cerebras when Mistral fails", async () => {
      // Mock Groq planning
      vi.spyOn(groqModule.groqService, "planTask").mockResolvedValue(
        "Step 1: Analyze"
      );

      // Mock Mistral failure
      vi.spyOn(mistralModule.mistralService, "executeTask").mockRejectedValue(
        new Error("Mistral API error")
      );

      // Mock Cerebras success
      vi.spyOn(cerebrasModule.cerebrasService, "executeTask").mockResolvedValue(
        "Fallback execution completed"
      );

      const result = await orchestrator.executeTask("Test task description");

      expect(result.success).toBe(true);
      expect(result.executedWith).toBe("cerebras");
      expect(result.result).toContain("Fallback");
    });

    it("should return error when all services fail", async () => {
      // Mock Groq planning
      vi.spyOn(groqModule.groqService, "planTask").mockResolvedValue(
        "Step 1: Analyze"
      );

      // Mock Mistral failure
      vi.spyOn(mistralModule.mistralService, "executeTask").mockRejectedValue(
        new Error("Mistral API error")
      );

      // Mock Cerebras failure
      vi.spyOn(cerebrasModule.cerebrasService, "executeTask").mockRejectedValue(
        new Error("Cerebras API error")
      );

      const result = await orchestrator.executeTask("Test task description");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle timeout correctly", async () => {
      vi.spyOn(groqModule.groqService, "planTask").mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const result = await orchestrator.executeTask("Test task", {
        timeout: 1000,
      });

      // Should timeout and handle gracefully
      expect(result).toBeDefined();
    });

    it("should use project context when provided", async () => {
      const planTaskSpy = vi
        .spyOn(groqModule.groqService, "planTask")
        .mockResolvedValue("Planned with context");

      vi.spyOn(mistralModule.mistralService, "executeTask").mockResolvedValue(
        "Executed"
      );

      const projectContext = "Project: AgentUniverse - AI Agent Platform";
      await orchestrator.executeTask("Test task", { projectContext });

      expect(planTaskSpy).toHaveBeenCalledWith("Test task", projectContext);
    });
  });

  describe("analyzeData", () => {
    it("should analyze data using Mistral", async () => {
      vi.spyOn(mistralModule.mistralService, "analyzeData").mockResolvedValue(
        "Analysis results: Pattern detected"
      );

      const result = await orchestrator.analyzeData(
        "CSV data content",
        "statistical"
      );

      expect(result.success).toBe(true);
      expect(result.executedWith).toBe("mistral");
      expect(result.result).toContain("Pattern");
    });

    it("should fallback to Cerebras for data analysis", async () => {
      vi.spyOn(mistralModule.mistralService, "analyzeData").mockRejectedValue(
        new Error("Mistral error")
      );

      vi.spyOn(
        cerebrasModule.cerebrasService,
        "summarizeDocument"
      ).mockResolvedValue("Summary of data");

      const result = await orchestrator.analyzeData("CSV data", "general");

      expect(result.success).toBe(true);
      expect(result.executedWith).toBe("cerebras");
    });
  });

  describe("generateContent", () => {
    it("should generate content using Mistral", async () => {
      vi.spyOn(mistralModule.mistralService, "generateContent").mockResolvedValue(
        "Generated content here"
      );

      const result = await orchestrator.generateContent(
        "blog_post",
        "Write about AI"
      );

      expect(result.success).toBe(true);
      expect(result.executedWith).toBe("mistral");
      expect(result.result).toContain("Generated");
    });

    it("should fallback to Cerebras for content generation", async () => {
      vi.spyOn(mistralModule.mistralService, "generateContent").mockRejectedValue(
        new Error("Mistral error")
      );

      vi.spyOn(
        cerebrasModule.cerebrasService,
        "generateResponse"
      ).mockResolvedValue("Fallback content");

      const result = await orchestrator.generateContent(
        "article",
        "Requirements"
      );

      expect(result.success).toBe(true);
      expect(result.executedWith).toBe("cerebras");
    });
  });
});
