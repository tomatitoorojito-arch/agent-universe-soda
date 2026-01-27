import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Zap } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch tasks using TRPC
  const tasksQuery = trpc.tasks.list.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Execute task mutation using TRPC
  const executeTaskMutation = trpc.tasks.execute.useMutation({
    onSuccess: (result) => {
      toast.success("Tarea completada exitosamente");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.result || "Tarea completada",
          timestamp: new Date(),
        },
      ]);
      // Refetch tasks
      tasksQuery.refetch();
    },
    onError: (error) => {
      toast.error("Error al ejecutar la tarea");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${error.message || "Error desconocido"}`,
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const taskInput = inputValue;
    setInputValue("");
    setIsExecuting(true);

    try {
      // Execute task
      await executeTaskMutation.mutateAsync({
        description: taskInput,
        projectContext: "AgentUniverse - Autonomous Agent Platform",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const tasks = tasksQuery.data || [];
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const inProgressTasks = tasks.filter(
    (t: any) => t.status === "planning" || t.status === "executing"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">AgentUniverse</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.name || "Usuario"}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="chat" className="text-white">
              Chat
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-white">
              Tareas
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white">
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Chat con Agentes</CardTitle>
                <CardDescription className="text-slate-400">
                  Describe tu tarea y los agentes la ejecutarán automáticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages Area */}
                <ScrollArea className="h-96 w-full rounded-md border border-slate-700 p-4 bg-slate-900">
                  <div ref={scrollRef} className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <p>Inicia una conversación escribiendo una tarea...</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-slate-100"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Describe tu tarea aquí..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isExecuting || executeTaskMutation.isPending}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    disabled={isExecuting || executeTaskMutation.isPending || !inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isExecuting || executeTaskMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Total de Tareas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-500">{tasks.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500">{completedTasks}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">En Progreso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-500">{inProgressTasks}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tasks List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Historial de Tareas</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{task.title}</p>
                          <p className="text-sm text-slate-400">{task.description}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-green-900 text-green-200"
                              : task.status === "failed"
                                ? "bg-red-900 text-red-200"
                                : "bg-yellow-900 text-yellow-200"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No hay tareas aún</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configuración</CardTitle>
                <CardDescription className="text-slate-400">
                  Gestiona tus preferencias y API Keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Nombre de Usuario</label>
                  <Input
                    value={user?.name || ""}
                    disabled
                    className="bg-slate-700 border-slate-600 text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Email</label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-slate-700 border-slate-600 text-slate-400"
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
