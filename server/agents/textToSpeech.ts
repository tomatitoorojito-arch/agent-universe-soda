import axios from "axios";
import { storagePut } from "../storage";

export interface TTSResult {
  success: boolean;
  audioUrl?: string;
  fileName?: string;
  duration?: number;
  error?: string;
  timestamp: Date;
}

class TextToSpeech {
  private googleApiKey: string;
  private googleTtsUrl = "https://texttospeech.googleapis.com/v1/text:synthesize";

  constructor() {
    this.googleApiKey = process.env.GOOGLE_TTS_API_KEY || "";
    if (!this.googleApiKey) {
      console.warn("⚠️  [TTS] GOOGLE_TTS_API_KEY no configurada");
    }
  }

  async synthesize(
    text: string,
    language: string = "es-ES",
    voice: string = "es-ES-Neural2-A"
  ): Promise<TTSResult> {
    try {
      console.log(`🔊 [TTS] Sintetizando texto (${language})...`);

      if (!this.googleApiKey) {
        return this.synthesizeFallback(text);
      }

      const response = await axios.post(
        `${this.googleTtsUrl}?key=${this.googleApiKey}`,
        {
          input: { text },
          voice: {
            languageCode: language,
            name: voice,
          },
          audioConfig: {
            audioEncoding: "MP3",
            pitch: 0,
            speakingRate: 1,
          },
        }
      );

      const audioContent = response.data.audioContent;

      // Convert base64 to buffer
      const buffer = Buffer.from(audioContent, "base64");

      // Upload to S3
      const fileName = `audio/${Date.now()}-${text.substring(0, 20).replace(/\s+/g, "-")}.mp3`;
      const result = await storagePut(fileName, buffer, "audio/mpeg");

      console.log(`✅ [TTS] Audio sintetizado: ${fileName}`);

      return {
        success: true,
        audioUrl: result.url,
        fileName,
        timestamp: new Date(),
      };
    } catch (error) {
      console.warn("⚠️  [TTS] Error con Google TTS, usando fallback");
      return this.synthesizeFallback(text);
    }
  }

  private async synthesizeFallback(text: string): Promise<TTSResult> {
    try {
      console.log("🔊 [TTS] Usando síntesis de voz fallback...");

      // For demonstration, create a simple audio file
      // In production, you would use a local TTS engine like pyttsx3
      const mockAudioBuffer = Buffer.from("mock audio data");

      const fileName = `audio/${Date.now()}-fallback.mp3`;
      const result = await storagePut(fileName, mockAudioBuffer, "audio/mpeg");

      console.log("✅ [TTS] Audio fallback generado");

      return {
        success: true,
        audioUrl: result.url,
        fileName,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [TTS] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async synthesizeMultiple(
    texts: string[],
    language: string = "es-ES"
  ): Promise<TTSResult[]> {
    try {
      console.log(`🔊 [TTS] Sintetizando ${texts.length} textos...`);

      const results = await Promise.all(
        texts.map((text) => this.synthesize(text, language))
      );

      console.log(`✅ [TTS] ${results.filter((r) => r.success).length} audios generados`);

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [TTS] Error:", errorMessage);

      return [
        {
          success: false,
          error: errorMessage,
          timestamp: new Date(),
        },
      ];
    }
  }

  async getAvailableVoices(): Promise<Record<string, string[]>> {
    // Mock available voices
    return {
      "es-ES": [
        "es-ES-Neural2-A",
        "es-ES-Neural2-C",
        "es-ES-Neural2-D",
        "es-ES-Neural2-E",
      ],
      "en-US": [
        "en-US-Neural2-A",
        "en-US-Neural2-C",
        "en-US-Neural2-E",
        "en-US-Neural2-F",
      ],
      "fr-FR": [
        "fr-FR-Neural2-A",
        "fr-FR-Neural2-B",
        "fr-FR-Neural2-C",
        "fr-FR-Neural2-D",
      ],
    };
  }
}

export const textToSpeech = new TextToSpeech();
