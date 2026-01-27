import PptxGenJs from "pptxgenjs";
import { storagePut } from "../storage";

export interface SlideContent {
  title: string;
  content: string;
  type?: "title" | "content" | "bullet";
  image?: string;
}

export interface PresentationResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  error?: string;
  slideCount?: number;
  timestamp: Date;
}

class SlidesGenerator {
  constructor() {
    // Constructor
  }

  async generatePresentation(
    title: string,
    slides: SlideContent[]
  ): Promise<PresentationResult> {
    try {
      console.log(`📊 [SlidesGenerator] Generando presentación: "${title}"`);

      const prs = new PptxGenJs();

      // Title slide
      const titleSlide = prs.addSlide();
      titleSlide.background = { color: "1a1a2e" };
      titleSlide.addText(title, {
        x: 0.5,
        y: 2.5,
        w: 9,
        h: 1.5,
        fontSize: 54,
        bold: true,
        color: "ffffff",
        align: "center",
      });
      titleSlide.addText("Generado por AgentUniverse", {
        x: 0.5,
        y: 4.2,
        w: 9,
        h: 0.5,
        fontSize: 18,
        color: "0066cc",
        align: "center",
      });

      // Content slides
      for (const slide of slides) {
        const contentSlide = prs.addSlide();
        contentSlide.background = { color: "0f0f1e" };

        // Title
        contentSlide.addText(slide.title, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.8,
          fontSize: 40,
          bold: true,
          color: "ffffff",
        });

        // Separator line
        contentSlide.addShape(prs.ShapeType.line, {
          x: 0.5,
          y: 1.4,
          w: 9,
          h: 0,
          line: { color: "0066cc", width: 2 },
        });

        // Content
        contentSlide.addText(slide.content, {
          x: 0.5,
          y: 1.8,
          w: 9,
          h: 5,
          fontSize: 14,
          color: "e0e0e0",
          align: "left",
          valign: "top",
        });

        // Footer
        contentSlide.addText(`${slides.indexOf(slide) + 1} / ${slides.length}`, {
          x: 0.5,
          y: 6.8,
          w: 9,
          h: 0.4,
          fontSize: 10,
          color: "666666",
          align: "right",
        });
      }

      // Save to buffer
      const buffer = await prs.write({ outputType: "arraybuffer" });

      // Upload to S3
      const fileName = `presentations/${Date.now()}-${title.replace(/\s+/g, "-")}.pptx`;
      const result = await storagePut(
        fileName,
        Buffer.from(buffer as ArrayBuffer),
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      );

      console.log(`✅ [SlidesGenerator] Presentación generada: ${fileName}`);

      return {
        success: true,
        fileUrl: result.url,
        fileName,
        slideCount: slides.length + 1,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [SlidesGenerator] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async generateFromMarkdown(
    title: string,
    markdown: string
  ): Promise<PresentationResult> {
    try {
      console.log(`📊 [SlidesGenerator] Generando desde Markdown: "${title}"`);

      // Parse markdown into slides
      const slideTexts = markdown.split(/\n---\n/);
      const slides: SlideContent[] = slideTexts.map((text) => {
        const lines = text.trim().split("\n");
        const slideTitle = lines[0].replace(/^#+\s*/, "");
        const content = lines.slice(1).join("\n").trim();

        return {
          title: slideTitle || "Slide",
          content: content || "Contenido",
        };
      });

      return this.generatePresentation(title, slides);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [SlidesGenerator] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}

export const slidesGenerator = new SlidesGenerator();
