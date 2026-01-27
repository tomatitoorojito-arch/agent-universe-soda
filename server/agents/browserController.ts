import puppeteer, { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";

export interface BrowserAction {
  type:
    | "navigate"
    | "click"
    | "type"
    | "screenshot"
    | "extract"
    | "wait"
    | "scroll"
    | "submit";
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
  xpath?: string;
}

export interface BrowserResult {
  success: boolean;
  data?: string | Buffer | Record<string, unknown>;
  error?: string;
  timestamp: Date;
}

class BrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    if (this.browser) return;

    try {
      console.log("🌐 [Browser] Iniciando navegador...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });
      console.log("✅ [Browser] Navegador iniciado");
    } catch (error) {
      console.error("❌ [Browser] Error al iniciar:", error);
      throw error;
    }
  }

  async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    this.page = await this.browser!.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    return this.page;
  }

  async navigate(url: string, timeout: number = 30000): Promise<BrowserResult> {
    try {
      if (!this.page) await this.createPage();

      console.log(`📍 [Browser] Navegando a: ${url}`);
      await this.page!.goto(url, { waitUntil: "networkidle2", timeout });
      console.log("✅ [Browser] Página cargada");

      return {
        success: true,
        data: { url, title: await this.page!.title() },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Browser] Error en navegación:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async click(selector: string): Promise<BrowserResult> {
    try {
      if (!this.page) throw new Error("No page available");

      console.log(`🖱️  [Browser] Haciendo clic en: ${selector}`);
      await this.page.click(selector);
      await this.page.waitForNavigation({ waitUntil: "networkidle2" }).catch(
        () => {} // Ignore if no navigation occurs
      );
      console.log("✅ [Browser] Clic realizado");

      return {
        success: true,
        data: { selector, action: "clicked" },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Browser] Error en clic:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async type(selector: string, text: string): Promise<BrowserResult> {
    try {
      if (!this.page) throw new Error("No page available");

      console.log(`⌨️  [Browser] Escribiendo en: ${selector}`);
      await this.page.focus(selector);
      await this.page.type(selector, text, { delay: 50 });
      console.log("✅ [Browser] Texto ingresado");

      return {
        success: true,
        data: { selector, text, action: "typed" },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Browser] Error al escribir:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async screenshot(): Promise<BrowserResult> {
    try {
      if (!this.page) throw new Error("No page available");

      console.log("📸 [Browser] Tomando screenshot...");
      const screenshot = await this.page.screenshot({ encoding: "base64" });
      console.log("✅ [Browser] Screenshot capturado");

      return {
        success: true,
        data: { screenshot, format: "base64" },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Browser] Error en screenshot:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async extract(selector?: string): Promise<BrowserResult> {
    try {
      if (!this.page) throw new Error("No page available");

      console.log(`🔍 [Browser] Extrayendo contenido...`);
      const html = await this.page.content();
      const $ = cheerio.load(html);

      let data: Record<string, unknown>;

      if (selector) {
        data = {
          content: $(selector).html(),
          text: $(selector).text(),
          selector,
        };
      } else {
        // Extract main content
        data = {
          title: $("title").text(),
          headings: $("h1, h2, h3")
            .map((_, el) => $(el).text())
            .get(),
          paragraphs: $("p")
            .map((_, el) => $(el).text())
            .get()
            .slice(0, 5),
          links: $("a")
            .map((_, el) => ({
              text: $(el).text(),
              href: $(el).attr("href"),
            }))
            .get()
            .slice(0, 10),
        };
      }

      console.log("✅ [Browser] Contenido extraído");
      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [Browser] Error en extracción:", errorMessage);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async wait(timeout: number): Promise<BrowserResult> {
    try {
      console.log(`⏳ [Browser] Esperando ${timeout}ms...`);
      await new Promise((resolve) => setTimeout(resolve, timeout));
      console.log("✅ [Browser] Espera completada");

      return {
        success: true,
        data: { waited: timeout },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async scroll(direction: "up" | "down" = "down", amount: number = 500): Promise<BrowserResult> {
    try {
      if (!this.page) throw new Error("No page available");

      console.log(`📜 [Browser] Scrolleando ${direction}...`);
      const scrollAmount = direction === "down" ? amount : -amount;
      await this.page.evaluate((scroll) => {
        window.scrollBy(0, scroll);
      }, scrollAmount);
      console.log("✅ [Browser] Scroll completado");

      return {
        success: true,
        data: { direction, amount },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async submit(selector: string): Promise<BrowserResult> {
    try {
      if (!this.page) throw new Error("No page available");

      console.log(`📤 [Browser] Enviando formulario: ${selector}`);
      await this.page.evaluate((sel) => {
        const form = document.querySelector(sel) as HTMLFormElement;
        if (form) form.submit();
      }, selector);

      await this.page.waitForNavigation({ waitUntil: "networkidle2" }).catch(
        () => {} // Ignore if no navigation occurs
      );
      console.log("✅ [Browser] Formulario enviado");

      return {
        success: true,
        data: { selector, action: "submitted" },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async executeActions(actions: BrowserAction[]): Promise<BrowserResult[]> {
    const results: BrowserResult[] = [];

    for (const action of actions) {
      let result: BrowserResult;

      switch (action.type) {
        case "navigate":
          result = await this.navigate(action.url!, action.timeout);
          break;
        case "click":
          result = await this.click(action.selector!);
          break;
        case "type":
          result = await this.type(action.selector!, action.value!);
          break;
        case "screenshot":
          result = await this.screenshot();
          break;
        case "extract":
          result = await this.extract(action.selector);
          break;
        case "wait":
          result = await this.wait(action.timeout || 1000);
          break;
        case "scroll":
          result = await this.scroll(
            (action.value as "up" | "down") || "down",
            action.timeout || 500
          );
          break;
        case "submit":
          result = await this.submit(action.selector!);
          break;
        default:
          result = {
            success: false,
            error: `Unknown action: ${(action as any).type}`,
            timestamp: new Date(),
          };
      }

      results.push(result);
    }

    return results;
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    console.log("🔌 [Browser] Navegador cerrado");
  }
}

export const browserController = new BrowserController();
