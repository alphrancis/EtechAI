import { useState, useRef, useCallback } from "react";
import { sendChat } from "@/services/api";
import type { Message, Model, Config } from "../types";

function ts(){
    return new Date().toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit"});
}

const SEED: Message[] = [{
    id: 1,
    role: "ai",
    text: "Welcome to the Google AI Open Platform. I'm Powered by Gemini. Ask me anything - or switch tools using the left panel to explore Prompt Builder, Vision Analysis, Code Execution, and Image Creation.",
    timestamp: ts(),
}];

export function useChat(model: Model | null, config: Config){
    const [messages, setMessages] = useState<Message[]>(SEED);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const send = useCallback(async (text: string) => {
        const t = text.trim();
        if(!t || typing || !model) return;

        const userMsg: Message = { id: Date.now(), role: "user", text: t, timestamp: ts()};
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);
        setError(null);

        const startedAt = Date.now();

        try{
            const res = await sendChat({
                model: model.id,
                messages: [...messages, userMsg].map((m) => ({ role: m.role, text: m.text})),
                config,
            });

            const responseTime = (Date.now() - startedAt) / 1000;

            setMessages((prev) => [
                ...prev, 
                { id: Date.now() + 1, role: "ai", text: res.text, timestamp: ts(), responseTime },
            ]);
        }catch (err: any) {
            setError(err.message || "Failed to get response");
        }finally {
            setTyping(false);
            setTimeout(scrollToBottom, 50);
        }
    }, [model, config, messages, typing]);

    return { messages, input, setInput, typing, error, send, bottomRef };
}