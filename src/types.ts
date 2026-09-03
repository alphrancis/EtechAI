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
    responseTime?: number;
}

export type Tool = "chat" | "prompt" | "vision" | "code" | "image-creation";

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

