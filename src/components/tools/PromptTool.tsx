import { useState } from "react";
import { Typing } from "../ui/Typing";
import { sendChat } from "../../services/api";
import type { Model } from "../../types";

    interface PromptToolProps {
    model: Model;
    }

    export function PromptTool({ model }: PromptToolProps) {
    const [system, setSystem] = useState("You are a helpful Google AI expert assistant. Answer concisely and accurately.");
    const [userMsg, setUser] = useState("");
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function run() {
        if (!userMsg.trim() || running) return;
        setRunning(true);
        setOutput("");
        setError(null);
        try {
        const res = await sendChat({
            model: model.id,
            messages: [
            { role: "system", text: system },
            { role: "user", text: userMsg },
            ],
            config: { temperature: 1, maxTokens: 8192, topP: 0.95, topK: 40, systemPrompt: system, safetyLevel: "medium" },
        });
        setOutput(res.text);
        } catch (err: any) {
        setError(err.message);
        } finally {
        setRunning(false);
        }
    }

    return (
        <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
        <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>
            System Instructions
            </label>
            <textarea
            rows={3}
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none leading-relaxed"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif", caretColor: model.color }}
            />
        </div>
        <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>
            User Prompt
            </label>
            <textarea
            rows={5}
            value={userMsg}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Write your prompt here…"
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none leading-relaxed"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif", caretColor: model.color }}
            />
        </div>
        <button
            onClick={run}
            disabled={!userMsg.trim() || running}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: userMsg.trim() && !running ? model.color : "rgba(255,255,255,0.07)", color: userMsg.trim() && !running ? "#000" : "rgba(255,255,255,0.25)" }}
        >
            {running ? <><Typing /><span>Generating…</span></> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg><span>Run Prompt</span></>}
        </button>
        {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>{error}</div>
        )}
        {output && (
            <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Output</label>
            <div className="rounded-xl px-4 py-4 text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.82)" }}>{output}</div>
            </div>
        )}
        </div>
    );
    }