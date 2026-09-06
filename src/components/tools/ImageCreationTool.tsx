import { useRef, useState } from "react";
import type { Model } from "../../types";
import type { ChatSession } from "@/hooks/useChatHistory";

interface ImageMessage {
    id: number;
    role: "user" | "ai";
    type: "text" | "image";
    content: string;
    timestamp: string;
}

interface ImageCreationToolProps {
  model: Model;
  historyCallbacks?: {
    onFirstMessage: (text: string) => string;
    onUserMessage: (sessionId: string, text: string) => void;
    onAiMessage: (sessionId: string, text: string) => void;
  };
  restoredSession?: ChatSession | null;
}

const SUGGESTIONS = [
  "A futuristic city at night",
  "A dragon made of crystals",
  "Astronaut on a neon beach",
  "Abstract AI neural network art",
];

function ts() {
  return new Date().toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function seedFromSession(session: ChatSession): ImageMessage[] {
  const msgs: ImageMessage[] = [];
  session.messages.forEach((m, i) => {
    if (m.role === "user") {
      msgs.push({ id: i * 2, role: "user", type: "text", content: m.content, timestamp: new Date(m.timestamp).toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" }) });
    } else {
      const isImage = m.content.startsWith("http");
      msgs.push({ id: i * 2 + 1, role: "ai", type: isImage ? "image" : "text", content: m.content, timestamp: new Date(m.timestamp).toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" }) });
    }
  });
  return msgs;
}

function ImageBubble({ url, modelColor }: { url: string; modelColor: string }) {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", minWidth: 200 }}>
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-8" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: modelColor, animation: `imgbounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>loading image…</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 text-xs" style={{ color: "#fca5a5", background: "rgba(239,68,68,0.08)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          Failed to load — Pollinations may be busy. Try again.
        </div>
      )}
      <div className="relative" style={{ display: status === "done" ? "block" : "none" }}>
        <img
          src={url}
          alt="Generated"
          className="max-w-xs max-h-72 object-cover block"
          onLoad={() => setStatus("done")}
          onError={() => setStatus("error")}
        />
        <a href={url} download target="_blank" rel="noopener noreferrer"
          className="absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}
          title="Download">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        </a>
      </div>
    </div>
  );
}

export function ImageCreationTool({ model, historyCallbacks, restoredSession }: ImageCreationToolProps) {
  const [messages, setMessages] = useState<ImageMessage[]>(
    restoredSession?.messages.length ? seedFromSession(restoredSession) : []
  );
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(restoredSession?.id ?? null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  async function generate(promptText: string) {
    const t = promptText.trim();
    if (!t || generating) return;

    if (historyCallbacks && !sessionIdRef.current) {
      sessionIdRef.current = historyCallbacks.onFirstMessage(t);
    }

    const userMsg: ImageMessage = { id: Date.now(), role: "user", type: "text", content: t, timestamp: ts() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setGenerating(true);
    setError(null);

    if (historyCallbacks && sessionIdRef.current) {
      historyCallbacks.onUserMessage(sessionIdRef.current, t);
    }

    scrollToBottom();

    try {
      const encoded = encodeURIComponent(t);
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024`;
      const aiMsg: ImageMessage = { id: Date.now() + 1, role: "ai", type: "image", content: url, timestamp: ts() };
      setMessages((prev) => [...prev, aiMsg]);
      if (historyCallbacks && sessionIdRef.current) {
        historyCallbacks.onAiMessage(sessionIdRef.current, url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setGenerating(false);
      scrollToBottom();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center text-center gap-4 mt-6 mb-2">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${model.color}22`, border: `1px solid ${model.color}44` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={model.color} strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>Image Creation</h2>
              <p className="text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                Describe what you want to see and I'll generate it for you.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => generate(s)}
                  className="text-xs px-3.5 py-2 rounded-xl transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => {
          const isAI = msg.role === "ai";
          return (
            <div key={msg.id} className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`} style={{ animation: "slide-up 0.22s ease-out both" }}>
              {isAI ? (
                <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${model.color}22`, border: `1px solid ${model.color}44` }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={model.color} strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              ) : (
                <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-black" style={{ background: model.color }}>
                  U
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[78%] ${isAI ? "" : "items-end"}`}>
                {msg.type === "text" ? (
                  <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={isAI
                      ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)" }
                      : { background: `${model.color}20`, border: `1px solid ${model.color}44`, color: "rgba(255,255,255,0.88)" }}>
                    {msg.content}
                  </div>
                ) : (
                  <ImageBubble url={msg.content} modelColor={model.color} />
                )}
                <span className="text-[10px] mx-0.5" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "JetBrains Mono, monospace" }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Generating indicator */}
        {generating && (
          <div className="flex gap-3" style={{ animation: "slide-up 0.22s ease-out both" }}>
            <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${model.color}22`, border: `1px solid ${model.color}44` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={model.color} strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: model.color, animation: `imgbounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono, monospace" }}>generating image…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-5 pb-5 flex-shrink-0">
        <div className="flex items-end gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <textarea ref={taRef} rows={1} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(input); } }}
            placeholder="Describe the image you want…"
            className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed"
            style={{ color: "rgba(255,255,255,0.85)", caretColor: model.color, fontFamily: "Outfit, sans-serif", minHeight: 22 }} />
          <button onClick={() => generate(input)} disabled={!input.trim() || generating}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{ background: input.trim() && !generating ? model.color : "rgba(255,255,255,0.06)", color: input.trim() && !generating ? "#000" : "rgba(255,255,255,0.2)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.14)", fontFamily: "JetBrains Mono, monospace" }}>
          Enter to generate · Shift+Enter for new line
        </p>
      </div>

      <style>{`@keyframes imgbounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
    </div>
  );
}