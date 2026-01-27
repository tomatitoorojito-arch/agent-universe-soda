import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { tasks, taskSteps, InsertTask, InsertTaskStep } from "../drizzle/schema";
import { orchestrator } from "./agents/orchestrator";
import { eq, and } from "drizzle-orm";

export const tasksRouter = router({
  /**
   * Create a new task
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        projectId: z.number().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const newTask: InsertTask = {
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        priority: input.priority || "medium",
        status: "pending",
      };

      const result = await db.insert(tasks).values(newTask);
      return { insertId: (result as any).insertId };
    }),

  /**
   * Get all tasks for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, ctx.user.id));
    return userTasks;
  }),

  /**
   * Get tasks for a specific project
   */
  listByProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const projectTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, ctx.user.id),
            eq(tasks.projectId, input.projectId)
          )
        );
      return projectTasks;
    }),

  /**
   * Get a specific task by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const taskResult = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));

      if (!taskResult || taskResult.length === 0) {
        throw new Error("Task not found");
      }

      return taskResult[0];
    }),

  /**
   * Execute a task using the agent orchestrator
   */
  execute: protectedProcedure
    .input(
      z.object({
        taskId: z.number().optional(),
        description: z.string().min(1),
        projectContext: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let taskId = input.taskId;

      // Create task if not provided
      if (!taskId) {
        const newTask: InsertTask = {
          userId: ctx.user.id,
          title: input.description.substring(0, 100),
          description: input.description,
          status: "planning",
        };

        const result = await db.insert(tasks).values(newTask);
        taskId = (result as any).insertId as number;
      } else {
        // Update task status to planning
        await db
          .update(tasks)
          .set({ status: "planning" })
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, ctx.user.id)));
      }

      try {
        // Execute task with orchestrator
        const executionResult = await orchestrator.executeTask(
          input.description,
          {
            projectContext: input.projectContext,
            retryOnFailure: true,
          }
        );

        if (executionResult.success) {
          // Update task with results
          await db
            .update(tasks)
            .set({
              status: "completed",
              result: executionResult.result || "",
              executedWith: executionResult.executedWith,
              completedAt: new Date(),
            })
            .where(eq(tasks.id, taskId));

          return {
            success: true,
            taskId,
            result: executionResult.result,
            plan: executionResult.plan,
            executedWith: executionResult.executedWith,
            duration: executionResult.duration,
          };
        } else {
          // Update task with error
          await db
            .update(tasks)
            .set({
              status: "failed",
              error: executionResult.error || "",
            })
            .where(eq(tasks.id, taskId));

          throw new Error(executionResult.error || "Task execution failed");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Update task with error
        await db
          .update(tasks)
          .set({
            status: "failed",
            error: errorMessage,
          })
          .where(eq(tasks.id, taskId));

        throw error;
      }
    }),

  /**
   * Update task status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "planning", "executing", "completed", "failed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .update(tasks)
        .set({ status: input.status })
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));

      return result;
    }),

  /**
   * Delete a task
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));

      return result;
    }),

  /**
   * Retry a failed task
   */
  retry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const taskResult = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));

      if (!taskResult || taskResult.length === 0) {
        throw new Error("Task not found");
      }

      const task = taskResult[0];

      // Re-execute the task
      return orchestrator.executeTask(task.description, {
        retryOnFailure: true,
      });
    }),
});
