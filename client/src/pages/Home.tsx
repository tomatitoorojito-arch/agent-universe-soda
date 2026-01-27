import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Zap, Image, FileText, Search, BarChart3, Globe, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  toolsUsed?: string[];
}

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Usar el nuevo agents router basado en Manus
  const executeTaskMutation = trpc.agents.executeTask.useMutation();
  const generateImageMutation = trpc.agents.generateImage.useMutation();
  const generateVideoMutation = trpc.agents.generateVideo.useMutation();
  const searchWebMutation = trpc.agents.searchWeb.useMutation();
  const analyzeDataMutation = trpc.agents.analyzeData.useMutation();
  const textToSpeechMutation = trpc.agents.textToSpeech.useMutation();

  // Auto-scroll al nuevo mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * Detectar tipo de tarea y ejecutar con herramienta apropiada
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const lowerInput = input.toLowerCase();
      let result: any;

      // Detectar tipo de tarea automáticamente
      if (
        lowerInput.includes("imagen") ||
        lowerInput.includes("generar") ||
        lowerInput.includes("dibujar") ||
        lowerInput.includes("visual")
      ) {
        result = await generateImageMutation.mutateAsync({
          prompt: input,
        });
      } else if (
        lowerInput.includes("vídeo") ||
        lowerInput.includes("video") ||
        lowerInput.includes("película")
      ) {
        result = await generateVideoMutation.mutateAsync({
          prompt: input,
        });
      } else if (
        lowerInput.includes("buscar") ||
        lowerInput.includes("internet") ||
        lowerInput.includes("información")
      ) {
        result = await searchWebMutation.mutateAsync({
          query: input,
        });
      } else if (
        lowerInput.includes("datos") ||
        lowerInput.includes("csv") ||
        lowerInput.includes("analiz") ||
        lowerInput.includes("estadístic")
      ) {
        result = await analyzeDataMutation.mutateAsync({
          data: input,
        });
      } else if (
        lowerInput.includes("naveg") ||
        lowerInput.includes("web") ||
        lowerInput.includes("sitio")
      ) {
        result = await executeTaskMutation.mutateAsync({
          description: input,
        });
      } else if (
        lowerInput.includes("audio") ||
        lowerInput.includes("voz") ||
        lowerInput.includes("habla")
      ) {
        result = await textToSpeechMutation.mutateAsync({
          text: input,
        });
      } else {
        // Ejecución general
        result = await executeTaskMutation.mutateAsync({
          description: input,
        });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.result || result.error || "Sin respuesta",
        timestamp: new Date(),
        model: result.executedWith || result.modelSelected,
        toolsUsed: result.toolsUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Por favor inicia sesión</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">AgentUniverse</h1>
        </div>

        <Button className="w-full mb-6" variant="default">
          + Nuevo Chat
        </Button>

        <div className="flex-1 overflow-auto">
          <div className="text-sm text-muted-foreground">
            {messages.length === 0 ? "Sin conversaciones" : `${messages.length} mensajes`}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {user?.name || "Usuario"}
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Zap className="w-16 h-16 text-primary mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  ¿En qué puedo ayudarte?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Soy AgentUniverse, tu asistente de IA. Puedo ayudarte con análisis, generación de contenido, automatización y mucho más.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setInput("Generar una imagen de un paisaje futurista")}
                  >
                    <Image className="w-4 h-4" />
                    Generar Imágenes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setInput("Generar un vídeo de un paisaje futurista")}
                  >
                    <FileText className="w-4 h-4" />
                    Generar Vídeo
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setInput("Buscar información sobre tecnología blockchain")}
                  >
                    <Search className="w-4 h-4" />
                    Buscar Web
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setInput("Analizar estos datos: 1,2,3,4,5")}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analizar Datos
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-foreground"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Streamdown>{message.content}</Streamdown>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      {message.model && (
                        <p className="text-xs opacity-70 mt-2">
                          Modelo: {message.model}
                          {message.toolsUsed && message.toolsUsed.length > 0 && (
                            <> | Herramientas: {message.toolsUsed.join(", ")}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border px-4 py-3 rounded-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-6 bg-card">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            AgentUniverse puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>
    </div>
  );
}
