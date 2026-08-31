    // src/components/tools/EmbeddingsTool.tsx
    import { useState } from "react";
    import { Typing } from "../ui/Typing";
    import { generateEmbeddings } from "../../services/api";
    import type { Model, EmbeddingResult } from "../../types";

    interface EmbeddingsToolProps {
    model: Model;
    }

    export function EmbeddingsTool({ model }: EmbeddingsToolProps) {
    const [textA, setTextA] = useState("Google Gemini is a powerful multimodal AI model.");
    const [textB, setTextB] = useState("Gemini can understand text, images, audio, and video.");
    const [result, setResult] = useState<EmbeddingResult | null>(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function embed() {
        setRunning(true);
        setResult(null);
        setError(null);
        try {
        const res = await generateEmbeddings(textA, textB, model.id);
        setResult(res);
        } catch (err: any) {
        setError(err.message);
        } finally {
        setRunning(false);
        }
    }

    return (
        <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
            {[
            { label: "Text A", val: textA, set: setTextA },
            { label: "Text B", val: textB, set: setTextB },
            ].map(({ label, val, set }) => (
            <div key={label}>
                <label className="text-[10px] tracking-widest uppercase font-semibold block mb-1.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>{label}</label>
                <textarea rows={3} value={val} onChange={(e) => set(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none leading-relaxed"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif" }} />
            </div>
            ))}
        </div>
        <button onClick={embed} disabled={running}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: !running ? model.color : "rgba(255,255,255,0.07)", color: !running ? "#000" : "rgba(255,255,255,0.25)" }}>
            {running ? <><Typing /><span>Embedding…</span></> : "Generate Embeddings"}
        </button>
        {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>{error}</div>}
        {result && (
            <div className="flex flex-col gap-3">
            {[
                { label: "Vector A (768-dim, showing first 8)", vec: result.vecA },
                { label: "Vector B (768-dim, showing first 8)", vec: result.vecB },
            ].map(({ label, vec }) => (
                <div key={label}>
                <p className="text-[10px] tracking-widest uppercase font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>{label}</p>
                <div className="rounded-xl p-3 flex flex-wrap gap-1.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {vec.map((v, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: v > 0 ? "#6bcf8e" : "#f07a6b", fontFamily: "JetBrains Mono, monospace" }}>{v}</span>
                    ))}
                    <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>…+760</span>
                </div>
                </div>
            ))}
            <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: `${model.color}12`, border: `1px solid ${model.color}33` }}>
                <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Cosine Similarity</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>Higher = more semantically similar</p>
                </div>
                <div className="text-right">
                <p className="text-2xl font-semibold tabular-nums" style={{ color: model.color, fontFamily: "JetBrains Mono, monospace" }}>{result.sim}</p>
                <p className="text-[10px]" style={{ color: result.sim > 0.8 ? "#6bcf8e" : result.sim > 0.5 ? "#f0c84a" : "#f07a6b" }}>
                    {result.sim > 0.8 ? "Very similar" : result.sim > 0.5 ? "Moderately similar" : "Dissimilar"}
                </p>
                </div>
            </div>
            </div>
        )}
        </div>
    );
    }