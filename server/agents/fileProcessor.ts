import * as fs from "fs";
import * as path from "path";

export interface FileProcessResult {
  success: boolean;
  fileName?: string;
  fileType?: string;
  content?: string | Record<string, unknown> | unknown[];
  metadata?: Record<string, unknown>;
  error?: string;
  timestamp: Date;
}

class FileProcessor {
  async processFile(filePath: string): Promise<FileProcessResult> {
    try {
      console.log(`📄 [FileProcessor] Procesando archivo: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
      }

      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      const stats = fs.statSync(filePath);

      const metadata = {
        fileName,
        fileSize: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: ext,
      };

      let content: string | Record<string, unknown>;
      let fileType = "unknown";

      switch (ext) {
        case ".txt":
          fileType = "text";
          content = fs.readFileSync(filePath, "utf-8");
          break;

        case ".json":
          fileType = "json";
          content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          break;

        case ".csv":
          fileType = "csv";
          content = fs.readFileSync(filePath, "utf-8");
          break;

        case ".md":
          fileType = "markdown";
          content = fs.readFileSync(filePath, "utf-8");
          break;

        case ".log":
          fileType = "log";
          content = fs.readFileSync(filePath, "utf-8");
          break;

        default:
          fileType = "binary";
          content = `Archivo binario: ${fileName}`;
      }

      console.log(`✅ [FileProcessor] Archivo procesado: ${fileName}`);

      return {
        success: true,
        fileName,
        fileType,
        content,
        metadata,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [FileProcessor] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async convertFile(
    inputPath: string,
    outputFormat: string
  ): Promise<FileProcessResult> {
    try {
      console.log(`🔄 [FileProcessor] Convirtiendo a ${outputFormat}...`);

      const inputExt = path.extname(inputPath).toLowerCase();
      const baseName = path.basename(inputPath, inputExt);

      // For demonstration, just read and return in new format
      const content = fs.readFileSync(inputPath, "utf-8");

      const outputPath = path.join(
        path.dirname(inputPath),
        `${baseName}.${outputFormat}`
      );

      // Write converted file
      fs.writeFileSync(outputPath, content);

      console.log(`✅ [FileProcessor] Archivo convertido: ${outputPath}`);

      return {
        success: true,
        fileName: path.basename(outputPath),
        fileType: outputFormat,
        metadata: {
          originalFile: inputPath,
          convertedFile: outputPath,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [FileProcessor] Error en conversión:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async extractMetadata(filePath: string): Promise<FileProcessResult> {
    try {
      console.log(`🔍 [FileProcessor] Extrayendo metadatos...`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();

      const metadata: Record<string, unknown> = {
        fileName: path.basename(filePath),
        filePath: filePath,
        fileSize: stats.size,
        fileSizeKB: (stats.size / 1024).toFixed(2),
        extension: ext,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        accessedAt: stats.atime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };

      console.log("✅ [FileProcessor] Metadatos extraídos");

      return {
        success: true,
        metadata,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [FileProcessor] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async listFiles(directoryPath: string): Promise<FileProcessResult> {
    try {
      console.log(`📂 [FileProcessor] Listando archivos en: ${directoryPath}`);

      if (!fs.existsSync(directoryPath)) {
        throw new Error(`Directorio no encontrado: ${directoryPath}`);
      }

      const files = fs.readdirSync(directoryPath);
      const fileList = files.map((file) => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        return {
          name: file,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
        };
      });

      console.log(`✅ [FileProcessor] ${fileList.length} archivos encontrados`);

      return {
        success: true,
        content: JSON.stringify(fileList),
        metadata: {
          directory: directoryPath,
          fileCount: fileList.length,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [FileProcessor] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async deleteFile(filePath: string): Promise<FileProcessResult> {
    try {
      console.log(`🗑️  [FileProcessor] Eliminando archivo: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
      }

      fs.unlinkSync(filePath);

      console.log("✅ [FileProcessor] Archivo eliminado");

      return {
        success: true,
        metadata: {
          deletedFile: filePath,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [FileProcessor] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}

export const fileProcessor = new FileProcessor();
