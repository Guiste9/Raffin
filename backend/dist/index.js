"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const chatbotRoutes_1 = __importDefault(require("./chatbotRoutes"));
// Carrega as variáveis de ambiente a partir do .env (forçando sobrescrever variáveis herdadas)
dotenv_1.default.config({ override: true });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Log de requisições simples
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Registro das rotas do Chatbot
app.use(chatbotRoutes_1.default);
// Rota de status simples (inclui verificação do Ollama)
app.get("/api/health", async (_req, res) => {
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
    let ollamaStatus = "offline";
    try {
        const ollamaResponse = await fetch(`${ollamaBaseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
        ollamaStatus = ollamaResponse.ok ? "online" : "offline";
    }
    catch {
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
