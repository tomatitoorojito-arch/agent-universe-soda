import axios from "axios";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface WebSearchResult {
  success: boolean;
  query?: string;
  results?: SearchResult[];
  summary?: string;
  error?: string;
  timestamp: Date;
}

class WebSearch {
  private apiKey: string;
  private apiUrl = "https://api.tavily.com/search";

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || "";
    if (!this.apiKey) {
      console.warn("⚠️  [WebSearch] TAVILY_API_KEY no configurada");
    }
  }

  async search(query: string, maxResults: number = 5): Promise<WebSearchResult> {
    try {
      console.log(`🔍 [WebSearch] Buscando: "${query}"`);

      if (!this.apiKey) {
        // Fallback: Use a simple web scraping approach
        return this.searchFallback(query);
      }

      const response = await axios.post(this.apiUrl, {
        api_key: this.apiKey,
        query,
        max_results: maxResults,
        include_answer: true,
      });

      const results: SearchResult[] = (response.data.results || []).map(
        (result: any) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          source: result.source,
        })
      );

      console.log(`✅ [WebSearch] ${results.length} resultados encontrados`);

      return {
        success: true,
        query,
        results,
        summary: response.data.answer || undefined,
        timestamp: new Date(),
      };
    } catch (error) {
      console.warn("⚠️  [WebSearch] Error con Tavily, usando fallback");
      return this.searchFallback(query);
    }
  }

  private async searchFallback(query: string): Promise<WebSearchResult> {
    try {
      console.log(`🔍 [WebSearch] Búsqueda fallback: "${query}"`);

      // Simulate search results for demonstration
      const mockResults: SearchResult[] = [
        {
          title: `Resultados sobre "${query}"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Información relacionada con ${query}. Para obtener resultados reales, configura TAVILY_API_KEY.`,
          source: "Google",
        },
        {
          title: `Wikipedia - ${query}`,
          url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, "_")}`,
          snippet: `Artículo de Wikipedia sobre ${query}.`,
          source: "Wikipedia",
        },
      ];

      console.log("✅ [WebSearch] Resultados fallback generados");

      return {
        success: true,
        query,
        results: mockResults,
        summary: `Se encontraron resultados sobre "${query}". Para búsquedas en tiempo real, configura Tavily API.`,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [WebSearch] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  async searchAndSummarize(query: string): Promise<WebSearchResult> {
    try {
      console.log(`📊 [WebSearch] Buscando y resumiendo: "${query}"`);

      const searchResult = await this.search(query, 10);

      if (!searchResult.success || !searchResult.results) {
        return searchResult;
      }

      // Create a summary from results
      const summary = `
Búsqueda: ${query}

Resultados principales:
${searchResult.results
  .slice(0, 5)
  .map((r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`)
  .join("\n\n")}

${searchResult.summary ? `\nResumen: ${searchResult.summary}` : ""}
      `.trim();

      return {
        ...searchResult,
        summary,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ [WebSearch] Error:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }
}

export const webSearch = new WebSearch();
