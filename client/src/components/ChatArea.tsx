import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Zap, Sparkles, Wand2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const MODELS = [
  { id: "mistral", name: "Mistral", icon: "✨" },
  { id: "groq", name: "Groq", icon: "⚡" },
  { id: "cerebras", name: "Cerebras", icon: "🧠" },
];

export default function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  selectedModel,
  onModelChange,
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSendMessage(inputValue);
    setInputValue("");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-semibold text-white">AgentUniverse</h2>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Modelo:</span>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-2 py-1 hover:border-slate-600 transition-colors"
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.icon} {model.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div ref={scrollRef} className="max-w-4xl mx-auto space-y-6">
          {isEmpty ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ¿En qué puedo ayudarte?
              </h3>
              <p className="text-slate-400 mb-8 max-w-md">
                Soy AgentUniverse, tu asistente de IA. Puedo ayudarte con análisis,
                generación de contenido, automatización y mucho más.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                <button className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-left group">
                  <div className="flex items-start gap-3">
                    <Wand2 className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-white text-sm">Generar Imágenes</p>
                      <p className="text-xs text-slate-400">Crea imágenes con IA</p>
                    </div>
                  </div>
                </button>

                <button className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-left group">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-white text-sm">Analizar Datos</p>
                      <p className="text-xs text-slate-400">Procesa archivos CSV/Excel</p>
                    </div>
                  </div>
                </button>

                <button className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-left group">
                  <div className="flex items-start gap-3">
                    <Wand2 className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-white text-sm">Crear Presentación</p>
                      <p className="text-xs text-slate-400">Genera PPTX profesionales</p>
                    </div>
                  </div>
                </button>

                <button className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-left group">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-green-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-medium text-white text-sm">Automatizar Web</p>
                      <p className="text-xs text-slate-400">Navega y extrae datos</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Messages
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2`}
              >
                <div
                  className={`max-w-2xl rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-100 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.isLoading && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs opacity-70">Procesando...</span>
                    </div>
                  )}
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 rounded-lg rounded-bl-none px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AgentUniverse está pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              placeholder="Escribe tu mensaje aquí..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            AgentUniverse puede cometer errores. Verifica información importante.
          </p>
        </form>
      </div>
    </div>
  );
}
