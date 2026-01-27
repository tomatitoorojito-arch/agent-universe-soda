import Replicate from "replicate";

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  error?: string;
  model?: string;
  timestamp: Date;
}

class ImageGenerator {
  private replicate: Replicate;

  constructor() {
    const apiToken = process.env.REPLICATE_API_KEY;
    if (!apiToken) {
      console.warn("⚠️  [ImageGenerator] REPLICATE_API_KEY no configurada");
    }
    this.replicate = new Replicate({
      auth: apiToken,
    });
  }

  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    try {
      console.log(`🎨 [ImageGenerator] Generando imagen: "${prompt}"`);

      // Use Stable Diffusion 3 via Replicate
      const output = await this.replicate.run(
        "stability-ai/stable-diffusion-3",
        {
          input: {
            prompt,
            negative_prompt: "blurry, low quality, distorted",
            num_inference_steps: 28,
            guidance_scale: 7.5,
          },
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;

      console.log("✅ [ImageGenerator] Imagen generada exitosamente");

      return {
        success: true,
        imageUrl: imageUrl as string,
        model: "stable-diffusion-3",
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [ImageGenerator] Error:", errorMessage);

      // Fallback to a simpler model
      try {
        console.log("🔄 [ImageGenerator] Intentando con modelo alternativo...");
        const output = await this.replicate.run(
          "stability-ai/stable-diffusion",
          {
            input: {
              prompt,
              num_outputs: 1,
              num_inference_steps: 50,
              guidance_scale: 7.5,
            },
          }
        );

        const imageUrl = Array.isArray(output) ? output[0] : output;

        console.log("✅ [ImageGenerator] Imagen generada con modelo alternativo");

        return {
          success: true,
          imageUrl: imageUrl as string,
          model: "stable-diffusion",
          timestamp: new Date(),
        };
      } catch (fallbackError) {
        const fallbackMessage =
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        console.error("❌ [ImageGenerator] Error en fallback:", fallbackMessage);

        return {
          success: false,
          error: `Generación de imagen fallida: ${fallbackMessage}`,
          timestamp: new Date(),
        };
      }
    }
  }

  async generateMultipleImages(
    prompt: string,
    count: number = 4
  ): Promise<ImageGenerationResult> {
    try {
      console.log(`🎨 [ImageGenerator] Generando ${count} imágenes: "${prompt}"`);

      const promises = Array(count)
        .fill(null)
        .map(() => this.generateImage(prompt));

      const results = await Promise.allSettled(promises);

      const imageUrls = results
        .filter((r) => r.status === "fulfilled" && (r.value as any).success)
        .map((r) => (r as PromiseFulfilledResult<ImageGenerationResult>).value.imageUrl)
        .filter(Boolean) as string[];

      if (imageUrls.length === 0) {
        throw new Error("No se pudieron generar imágenes");
      }

      console.log(`✅ [ImageGenerator] ${imageUrls.length} imágenes generadas`);

      return {
        success: true,
        imageUrls,
        model: "stable-diffusion",
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [ImageGenerator] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async editImage(
    imageUrl: string,
    prompt: string
  ): Promise<ImageGenerationResult> {
    try {
      console.log(`🎨 [ImageGenerator] Editando imagen: "${prompt}"`);

      // Download the image first
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      // Use inpainting model
      const output = await this.replicate.run(
        "stability-ai/stable-diffusion-inpainting",
        {
          input: {
            prompt,
            image: dataUrl,
            num_inference_steps: 50,
            guidance_scale: 7.5,
          },
        }
      );

      const editedImageUrl = Array.isArray(output) ? output[0] : output;

      console.log("✅ [ImageGenerator] Imagen editada exitosamente");

      return {
        success: true,
        imageUrl: editedImageUrl as string,
        model: "stable-diffusion-inpainting",
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [ImageGenerator] Error en edición:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}

export const imageGenerator = new ImageGenerator();
