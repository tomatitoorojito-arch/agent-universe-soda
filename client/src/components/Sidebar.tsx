import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Plus, MessageSquare, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

interface Conversation {
  id: string;
  title: string;
  date: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  currentConversationId?: string;
  onLogout: () => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  conversations,
  onNewChat,
  onSelectConversation,
  currentConversationId,
  onLogout,
}: SidebarProps) {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700 flex flex-col transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">AgentUniverse</h1>
          <button
            onClick={onToggle}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-700">
          <Button
            onClick={onNewChat}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Chat
          </Button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">
              Historial
            </p>
            {conversations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No hay conversaciones aún
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onToggle();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors truncate ${
                    currentConversationId === conv.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                  title={conv.title}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{conv.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{conv.date}</p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm truncate">{user?.name || "Usuario"}</span>
              </div>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-2 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 lg:hidden z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
