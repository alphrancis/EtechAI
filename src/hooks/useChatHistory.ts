import { useState, useCallback } from "react";
import type { Tool } from "../types";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    tool: Tool;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = "ai_platform_chat_history";
const MAX_SESSIONS = 50;

function load(): ChatSession[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
        return [];
    }
}

function save(sessions: ChatSession[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

export function useChatHistory() {
    const [sessions, setSessions] = useState<ChatSession[]>(load);
    const [activeId, setActiveId] = useState<string | null>(null);

    const createSession = useCallback((tool: Tool, firstPrompt: string): string => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const session: ChatSession = {
        id,
        tool,
        title: firstPrompt.slice(0, 48) + (firstPrompt.length > 48 ? "…" : ""),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        };
        setSessions((prev) => {
        const next = [session, ...prev];
        save(next);
        return next;
        });
        setActiveId(id);
        return id;
    }, []);

    const addMessage = useCallback((sessionId: string, message: ChatMessage) => {
        setSessions((prev) => {
        const next = prev.map((s) =>
            s.id === sessionId
            ? { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
            : s
        );
        save(next);
        return next;
        });
    }, []);

    const deleteSession = useCallback((id: string) => {
        setSessions((prev) => {
        const next = prev.filter((s) => s.id !== id);
        save(next);
        return next;
        });
        setActiveId((prev) => (prev === id ? null : prev));
    }, []);

    const clearAll = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setSessions([]);
        setActiveId(null);
    }, []);

    const getSession = useCallback(
        (id: string) => sessions.find((s) => s.id === id) ?? null,
        [sessions]
    );

    return { sessions, activeId, setActiveId, createSession, addMessage, deleteSession, clearAll, getSession };
}