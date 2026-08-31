// src/components/tools/ChatTool.tsx
import { useEffect, useRef } from "react";
import { LogoMark } from "../ui/LogoMark";
import { Typing } from "../ui/Typing";
import { useChat } from "../../hooks/useChat";
import type { Model, Config } from "../../types";

interface ChatToolProps {
    model: Model;
    config: Config;
}

const SUGGESTIONS = [
    "What is the Gemini API?",
    "Show me a Python example",
    "Explain Vertex AI",
    "How does TensorFlow work?",
];

export function ChatTool({ model, config }: ChatToolProps) {
    const { messages, input, setInput, typing, error, send, bottomRef } = useChat(model, config);
    const taRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing, bottomRef]);

    return (
        <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            {messages.length === 1 && (
            <div className="flex flex-col items-center text-center gap-4 mt-6 mb-2">
                <LogoMark size={44} />
                <div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>
                    Chat with {model.name}
                </h2>
                <p className="text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                    Ask anything about the Google AI ecosystem, get code examples, or explore capabilities.
                </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                    <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3.5 py-2 rounded-xl transition-all duration-150"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    >
                    {s}
                    </button>
                ))}
                </div>
            </div>
            )}

            {messages.map((msg) => {
            const isAI = msg.role === "ai";
            const hasCode = msg.text.includes("```");
            const parts = hasCode ? msg.text.split(/(```[\s\S]*?```)/g) : null;

            return (
                <div key={msg.id} className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`} style={{ animation: "slide-up 0.22s ease-out both" }}>
                {isAI ? (
                    <div className="flex-shrink-0 mt-0.5"><LogoMark size={26} /></div>
                ) : (
                    <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-black" style={{ background: model.color }}>
                    U
                    </div>
                )}
                <div className={`flex flex-col gap-1 max-w-[78%] ${isAI ? "" : "items-end"}`}>
                    {isAI && (
                    <span className="text-[10px] ml-0.5" style={{ color: "rgba(255,255,255,0.28)", fontFamily: "JetBrains Mono, monospace" }}>Gemini</span>
                    )}
                    <div
                    className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={isAI
                        ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)" }
                        : { background: `${model.color}20`, border: `1px solid ${model.color}44`, color: "rgba(255,255,255,0.88)" }}
                    >
                    {hasCode && parts
                        ? parts.map((p, i) => {
                            if (p.startsWith("```")) {
                            const code = p.replace(/```\w*\n?/, "").replace(/```$/, "");
                            return (
                                <pre key={i} className="rounded-lg p-3 mt-2 mb-1 text-xs overflow-x-auto" style={{ background: "rgba(0,0,0,0.4)", color: "#a8d8a0", fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6 }}>
                                {code}
                                </pre>
                            );
                            }
                            return <span key={i}>{p}</span>;
                        })
                        : msg.text}
                    </div>
                    <span className="text-[10px] mx-0.5" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "JetBrains Mono, monospace" }}>{msg.timestamp}</span>
                </div>
                </div>
            );
            })}

            {typing && (
            <div className="flex items-center gap-3" style={{ animation: "slide-up 0.22s ease-out both" }}>
                <div className="flex-shrink-0"><LogoMark size={26} /></div>
                <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Typing />
                </div>
            </div>
            )}

            {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                Error: {error}
            </div>
            )}

            <div ref={bottomRef} />
        </div>

        <div className="px-6 pb-1 flex justify-end">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "JetBrains Mono, monospace" }}>
            {messages.reduce((a, m) => a + m.text.split(" ").length, 0)} tokens · {config.maxTokens} max
            </span>
        </div>

        <div className="px-5 pb-5 flex-shrink-0">
            <div className="flex items-end gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <textarea
                ref={taRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Type a message…"
                className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)", caretColor: model.color, fontFamily: "Outfit, sans-serif", minHeight: 22 }}
            />
            <button
                onClick={() => send(input)}
                disabled={!input.trim() || typing}
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
                style={{ background: input.trim() && !typing ? model.color : "rgba(255,255,255,0.06)", color: input.trim() && !typing ? "#000" : "rgba(255,255,255,0.2)" }}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
            </div>
            <p className="text-center text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.14)", fontFamily: "JetBrains Mono, monospace" }}>
            Enter to send · Shift+Enter for new line
            </p>
        </div>
        </div>
    );
}