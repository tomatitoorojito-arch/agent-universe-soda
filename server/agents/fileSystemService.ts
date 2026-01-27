import fs from "fs/promises";
import path from "path";
import axios from "axios";

/**
 * Servicio de Sistema de Archivos
 * Permite que la IA gestione archivos: descargar, subir, leer, escribir
 */
export class FileSystemService {
  private static instance: FileSystemService;
  private workDir = "/tmp/agent-universe-workspace";

  private constructor() {
    this.initializeWorkspace();
  }

  public static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  /**
   * Inicializa el directorio de trabajo
   */
  private async initializeWorkspace(): Promise<void> {
    try {
      await fs.mkdir(this.workDir, { recursive: true });
      console.log(`📁 [FileSystem] Workspace inicializado en: ${this.workDir}`);
    } catch (error) {
      console.error("❌ [FileSystem] Error inicializando workspace:", error);
    }
  }

  /**
   * Lee un archivo del workspace
   */
  async readFile(filename: string): Promise<string> {
    const filePath = path.join(this.workDir, filename);
    console.log(`📖 [FileSystem] Leyendo archivo: ${filename}`);
    return await fs.readFile(filePath, "utf-8");
  }

  /**
   * Escribe un archivo en el workspace
   */
  async writeFile(filename: string, content: string): Promise<boolean> {
    const filePath = path.join(this.workDir, filename);
    try {
      await fs.writeFile(filePath, content, "utf-8");
      console.log(`✍️ [FileSystem] Archivo escrito: ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ [FileSystem] Error escribiendo archivo:`, error);
      return false;
    }
  }

  /**
   * Descarga un archivo de internet
   */
  async downloadFile(url: string, filename: string): Promise<boolean> {
    const filePath = path.join(this.workDir, filename);
    try {
      console.log(`⬇️ [FileSystem] Descargando: ${url}`);
      const response = await axios.get(url, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, response.data);
      console.log(`✅ [FileSystem] Archivo descargado: ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ [FileSystem] Error descargando archivo:`, error);
      return false;
    }
  }

  /**
   * Lista los archivos en el workspace
   */
  async listFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.workDir);
      console.log(`📂 [FileSystem] Archivos en workspace:`, files);
      return files;
    } catch (error) {
      console.error(`❌ [FileSystem] Error listando archivos:`, error);
      return [];
    }
  }

  /**
   * Obtiene la ruta del workspace
   */
  getWorkspacePath(): string {
    return this.workDir;
  }

  /**
   * Obtiene la ruta completa de un archivo
   */
  getFilePath(filename: string): string {
    return path.join(this.workDir, filename);
  }

  /**
   * Elimina un archivo
   */
  async deleteFile(filename: string): Promise<boolean> {
    const filePath = path.join(this.workDir, filename);
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ [FileSystem] Archivo eliminado: ${filename}`);
      return true;
    } catch (error) {
      console.error(`❌ [FileSystem] Error eliminando archivo:`, error);
      return false;
    }
  }
}

export const fileSystemService = FileSystemService.getInstance();
