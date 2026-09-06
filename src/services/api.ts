const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

import type { Model, ChatRequest, ChatResponse, Config} from "../types";

class ApiError extends Error {
    constructor(public status: number, message: string){
        super(message);
        this.name = "ApiError";
    }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T>{
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json"},
        ...options,
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
}

export async function fetchModels(): Promise<Model[]> {
    return fetchJson<Model[]>(`${API_BASE}/api/models`);
}

export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
    return fetchJson<ChatResponse>(`${API_BASE}/api/chat`, {
        method: "POST",
        body: JSON.stringify(req),
    });
}


export async function analyzeImage(imageBase64: string, prompt: string, modelId: string): Promise<string>{
    const res = await fetch(`${API_BASE}/api/vision`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ image: imageBase64, prompt, model: modelId}),
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    const data = await res.json();
    return data.text;
}

export async function runCode(code: string, modelId: string): Promise<string>{
    const res = await fetch(`${API_BASE}/api/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ code, model: modelId}),
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return (await res.json()).text;
}

export { ApiError };