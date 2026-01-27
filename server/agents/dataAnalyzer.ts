import * as fs from "fs";
import * as path from "path";

export interface AnalysisResult {
  success: boolean;
  analysis?: Record<string, unknown>;
  statistics?: Record<string, unknown>;
  charts?: Array<{ type: string; data: unknown }>;
  summary?: string;
  error?: string;
  timestamp: Date;
}

class DataAnalyzer {
  async analyzeCSV(filePath: string): Promise<AnalysisResult> {
    try {
      console.log(`📊 [DataAnalyzer] Analizando CSV: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        throw new Error("El archivo CSV está vacío");
      }

      // Parse CSV
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) =>
        line.split(",").map((cell) => cell.trim())
      );

      // Basic statistics
      const statistics: Record<string, unknown> = {
        totalRows: rows.length,
        totalColumns: headers.length,
        columns: headers,
      };

      // Try to extract numeric columns
      const numericColumns: Record<string, number[]> = {};

      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const values = rows
          .map((row) => parseFloat(row[colIndex]))
          .filter((v) => !isNaN(v));

        if (values.length > 0) {
          numericColumns[headers[colIndex]] = values;

          // Calculate stats for numeric columns
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = sum / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

          statistics[`${headers[colIndex]}_stats`] = {
            count: values.length,
            sum,
            average: avg,
            min,
            max,
          };
        }
      }

      console.log("✅ [DataAnalyzer] CSV analizado");

      return {
        success: true,
        analysis: {
          headers,
          rowCount: rows.length,
          columnCount: headers.length,
          preview: rows.slice(0, 5),
        },
        statistics,
        summary: `Archivo CSV con ${rows.length} filas y ${headers.length} columnas. Columnas: ${headers.join(", ")}`,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [DataAnalyzer] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async analyzeJSON(filePath: string): Promise<AnalysisResult> {
    try {
      console.log(`📊 [DataAnalyzer] Analizando JSON: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);

      const analysis: Record<string, unknown> = {
        type: Array.isArray(data) ? "array" : "object",
        isArray: Array.isArray(data),
      };

      if (Array.isArray(data)) {
        analysis.itemCount = data.length;
        analysis.firstItem = data[0];
        analysis.keys = Object.keys(data[0] || {});
      } else {
        analysis.keys = Object.keys(data);
        analysis.structure = data;
      }

      console.log("✅ [DataAnalyzer] JSON analizado");

      return {
        success: true,
        analysis,
        summary: `JSON ${Array.isArray(data) ? `con ${data.length} elementos` : "objeto"} analizado correctamente`,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [DataAnalyzer] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async generateCharts(data: Record<string, unknown>[]): Promise<AnalysisResult> {
    try {
      console.log("📈 [DataAnalyzer] Generando gráficos...");

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Datos inválidos para gráficos");
      }

      const charts: Array<{ type: string; data: unknown }> = [];

      // Extract numeric columns for charts
      const firstItem = data[0];
      const keys = Object.keys(firstItem);

      for (const key of keys) {
        const values = data.map((item) => (item as any)[key]);
        const numericValues = values.filter((v) => typeof v === "number");

        if (numericValues.length > 0) {
          charts.push({
            type: "bar",
            data: {
              labels: data.map((_, i) => `Item ${i + 1}`),
              datasets: [
                {
                  label: key,
                  data: numericValues,
                  backgroundColor: "rgba(0, 102, 204, 0.5)",
                  borderColor: "rgb(0, 102, 204)",
                  borderWidth: 1,
                },
              ],
            },
          });
        }
      }

      console.log(`✅ [DataAnalyzer] ${charts.length} gráficos generados`);

      return {
        success: true,
        charts,
        summary: `Se generaron ${charts.length} gráficos a partir de los datos`,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [DataAnalyzer] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async compareDatasets(file1: string, file2: string): Promise<AnalysisResult> {
    try {
      console.log(`📊 [DataAnalyzer] Comparando datasets...`);

      const analysis1 = await this.analyzeCSV(file1);
      const analysis2 = await this.analyzeCSV(file2);

      if (!analysis1.success || !analysis2.success) {
        throw new Error("Error al analizar uno de los archivos");
      }

      const comparison = {
        file1: analysis1.analysis,
        file2: analysis2.analysis,
        differences: {
          rowDifference: (analysis2.analysis as any).rowCount - (analysis1.analysis as any).rowCount,
          columnDifference:
            (analysis2.analysis as any).columnCount - (analysis1.analysis as any).columnCount,
        },
      };

      console.log("✅ [DataAnalyzer] Datasets comparados");

      return {
        success: true,
        analysis: comparison,
        summary: "Comparación de datasets completada",
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [DataAnalyzer] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}

export const dataAnalyzer = new DataAnalyzer();
