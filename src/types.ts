export interface Model{
    id: string;
    name: string;
    badge: string;
    color: string;
    description: string;
}
export type Role = "user" | "ai" | "system";

export interface Message {
    id: number;
    role: Role;
    text: string;
    timestamp: string;
}

export type Tool = "chat" | "prompt" | "vision" | "code" | "embeddings";

export interface Config {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK:number;
    systemPrompt: string;
    safetyLevel: "none" | "low" | "medium" | "high";
}

export interface ChatRequest{
    model: string;
    messages: { role: Role; text: string} [];
    config: Config;
}

export interface ChatResponse {
    text: string;
    model: string;
    tokenUsed?: { input: number; output: number};
}

export interface EmbeddingResult {
    vecA: number[];
    vecB: number[];
    sim: number;
    
}