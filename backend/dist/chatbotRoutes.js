"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faq_json_1 = __importDefault(require("./faq.json"));
const router = (0, express_1.Router)();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const FAQ_ENTRIES = faq_json_1.default;
// ---------------------------------------------------------------------------
// "RAG leve": busca por palavra-chave nas entradas do FAQ.
// Pontua cada entrada pela quantidade de keywords que aparecem na pergunta do usuário.
// ---------------------------------------------------------------------------
function retrieveRelevantContext(userMessage, topK = 3) {
    const normalized = userMessage.toLowerCase();
    const scored = FAQ_ENTRIES.map((entry) => {
        const score = entry.keywords.reduce((acc, kw) => {
            return normalized.includes(kw.toLowerCase()) ? acc + 1 : acc;
        }, 0);
        return { entry, score };
    });
    return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((s) => s.entry);
}
function buildSystemPrompt(relevantEntries) {
    const contextBlock = relevantEntries.length
        ? relevantEntries.map((e) => `- ${e.content}`).join("\n")
        : "Nenhum trecho específico encontrado na base de conhecimento para esta pergunta.";
    return `Você é o assistente virtual oficial do Raffin, um marketplace moderno de multipropriedades baseado em blockchain.
Responda SOMENTE com base no contexto abaixo, extraído da base de conhecimento oficial do Raffin.
Se a pergunta do usuário não puder ser respondida diretamente com as informações desse contexto, diga educadamente que você não possui essa informação no momento e sugira que o usuário entre em contato com o suporte humano.
Seja breve, amigável, direto e responda em português. Não invente nenhuma informação fora do contexto.

Contexto de suporte do Raffin:
${contextBlock}`;
}
async function generateLocalReply(systemPrompt, history, message) {
    const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((msg) => ({
            role: msg.role,
            content: msg.content,
        })),
        { role: "user", content: message },
    ];
    const apiResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: false,
            options: {
                temperature: 0.2,
                num_predict: 800,
            },
        }),
    });
    if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        console.error("Erro retornado pelo Ollama:", errText);
        throw new Error("OLLAMA_API_ERROR");
    }
    const data = (await apiResponse.json());
    const replyText = data.message?.content?.trim() || "";
    if (!replyText) {
        throw new Error("OLLAMA_EMPTY_RESPONSE");
    }
    return replyText;
}
// ---------------------------------------------------------------------------
// Rota principal do chatbot
// POST /api/chat  { message: string, history?: [...] }
// ---------------------------------------------------------------------------
router.post("/api/chat", async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Campo 'message' é obrigatório e deve ser uma string." });
        }
        const relevantEntries = retrieveRelevantContext(message);
        const systemPrompt = buildSystemPrompt(relevantEntries);
        const replyText = await generateLocalReply(systemPrompt, history, message);
        return res.json({
            reply: replyText,
            sourcesUsed: relevantEntries.map((e) => e.id),
        });
    }
    catch (err) {
        const error = err;
        if (error.code === "ECONNREFUSED" || error.cause && error.cause.code === "ECONNREFUSED") {
            console.error("Ollama não está acessível em:", OLLAMA_BASE_URL);
            return res.status(503).json({
                error: `O serviço de IA local (Ollama) não está rodando. Instale o Ollama, execute "ollama pull ${OLLAMA_MODEL}" e inicie o serviço antes de usar o chatbot.`,
            });
        }
        if (error.message === "OLLAMA_API_ERROR") {
            return res.status(502).json({
                error: `Falha ao obter resposta do modelo local "${OLLAMA_MODEL}". Verifique se o modelo foi baixado com "ollama pull ${OLLAMA_MODEL}".`,
            });
        }
        if (error.message === "OLLAMA_EMPTY_RESPONSE") {
            return res.status(500).json({ error: "O modelo local retornou uma resposta vazia." });
        }
        console.error("Erro na rota /api/chat:", err);
        return res.status(500).json({ error: "Erro interno no servidor de chat." });
    }
});
exports.default = router;
