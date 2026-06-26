import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/chat`
  : "http://localhost:3001/api/chat";

const QUICK_SUGGESTIONS = [
  { label: "O que é multipropriedade?", text: "O que é multipropriedade e como ela funciona?" },
  { label: "Como comprar cota?", text: "Como faço para comprar uma cota no Raffin?" },
  { label: "Blockchain no Raffin", text: "Qual o papel da blockchain no Raffin?" },
  { label: "Revenda de cotas", text: "Como funciona a revenda de cotas no marketplace?" },
  { label: "Taxas da plataforma", text: "Quais são as taxas cobradas pelo Raffin?" },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente virtual do Raffin. Posso te ajudar a entender como funciona a multipropriedade, blockchain, compra e revenda de cotas no nosso sistema. O que você gostaria de saber?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Faz scroll automático até o final da conversa quando há novas mensagens ou quando abre o chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen, isLoading]);

  async function handleSend(textToSend: string) {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    // Adiciona a mensagem do usuário à lista
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: updatedHistory.slice(1, -1), // Envia histórico excluindo a mensagem de boas-vindas inicial e a última enviada
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha na resposta do servidor");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.message && err.message !== "Failed to fetch"
              ? err.message
              : "Desculpe, ocorreu um erro de conexão com o assistente. Certifique-se de que o backend (porta 3001) e o Ollama estão rodando e tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSend(input);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* Janela do Chat */}
      {isOpen && (
        <div
          className={`
            w-96 h-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]
            bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl
            shadow-2xl flex flex-col overflow-hidden mb-4
            transition-all duration-300 transform origin-bottom-right scale-100 animate-in fade-in slide-in-from-bottom-5
          `}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Avatar da IA com indicador Online */}
              <div className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">Suporte Raffin</h3>
                <span className="text-xs text-indigo-200">Online • Assistente Virtual</span>
              </div>
            </div>
            {/* Botão de Fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              aria-label="Fechar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Área de Mensagens */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  m.role === "user" ? "self-end items-end" : "self-start items-start"
                } animate-in fade-in duration-200`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none"
                      : "bg-gray-850 border border-gray-800 text-gray-100 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Balão de digitando */}
            {isLoading && (
              <div className="self-start flex flex-col items-start gap-1 max-w-[85%] animate-pulse">
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-gray-850 border border-gray-800 text-gray-400 text-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-225" />
                </div>
              </div>
            )}
          </div>

          {/* Atalhos de perguntas rápidas */}
          <div className="px-4 py-2 bg-gray-950/20 border-t border-gray-800/50 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
            {QUICK_SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSend(suggestion.text)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700/80 border border-gray-700/50 text-gray-300 rounded-full cursor-pointer transition-all hover:border-indigo-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          {/* Campo de Entrada de Texto */}
          <div className="p-3 bg-gray-950/60 border-t border-gray-800 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua dúvida..."
              disabled={isLoading}
              className="flex-1 bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-60"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center"
              aria-label="Enviar mensagem"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Botão Flutuante (FAB) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xl cursor-pointer hover:shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigo-400/20 group relative overflow-hidden"
        aria-label={isOpen ? "Fechar chat de suporte" : "Abrir chat de suporte"}
      >
        <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isOpen ? (
          <svg className="w-6 h-6 animate-in spin-in-90 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 animate-in zoom-in-50 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
