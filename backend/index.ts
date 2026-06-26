import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatbotRoutes from "./chatbotRoutes";

// Carrega as variáveis de ambiente a partir do .env (forçando sobrescrever variáveis herdadas)
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Log de requisições simples
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Registro das rotas do Chatbot
app.use(chatbotRoutes);

// Rota de status simples (inclui verificação do Ollama)
app.get("/api/health", async (_req, res) => {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";

  let ollamaStatus: "online" | "offline" = "offline";
  try {
    const ollamaResponse = await fetch(`${ollamaBaseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    ollamaStatus = ollamaResponse.ok ? "online" : "offline";
  } catch {
    ollamaStatus = "offline";
  }

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    llm: {
      provider: "ollama",
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      status: ollamaStatus,
    },
  });
});

// Inicialização do servidor (recarregado após salvar .env)
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Servidor do Chatbot Raffin Iniciado!`);
  console.log(` Porta: ${PORT}`);
  console.log(` URL Local: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
