import { useState, useRef } from "react";
import { Typing } from "../ui/Typing";
import { analyzeImage } from "../../services/api";
import type { Model } from "../../types";

    interface VisionToolProps {
    model: Model;
    }

    export function VisionTool({ model }: VisionToolProps) {
    const [prompt, setPrompt] = useState("Describe this image in detail.");
    const [preview, setPreview] = useState<string | null>(null);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    function onFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = (ev) => setPreview(ev.target?.result as string);
        r.readAsDataURL(f);
    }

    async function analyze() {
        if (!preview || running) return;
        setRunning(true);
        setOutput("");
        setError(null);
        try {
        const res = await analyzeImage(preview, prompt, model.id);
        setOutput(res);
        } catch (err: any) {
        setError(err.message);
        } finally {
        setRunning(false);
        }
    }

    return (
        <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
        <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Upload Image</label>
            <div
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-all duration-150"
            style={{ borderColor: preview ? `${model.color}66` : "rgba(255,255,255,0.1)", background: preview ? `${model.color}08` : "rgba(255,255,255,0.02)" }}
            >
            {preview ? <img src={preview} alt="upload preview" className="max-h-40 rounded-lg object-contain" /> : <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Click to upload image</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>PNG, JPG, WEBP, GIF supported</span>
            </>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
        <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Analysis Prompt</label>
            <textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif" }} />
        </div>
        <button onClick={analyze} disabled={!preview || running}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: preview && !running ? model.color : "rgba(255,255,255,0.07)", color: preview && !running ? "#000" : "rgba(255,255,255,0.25)" }}>
            {running ? <><Typing /><span>Analyzing…</span></> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg><span>Analyze Image</span></>}
        </button>
        {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>{error}</div>}
        {output && <div className="rounded-xl px-4 py-4 text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.82)" }}>{output}</div>}
        </div>
    );
    }