import { useState } from "react";
import { Typing } from "../ui/Typing";
import type { Model } from "../../types";

interface ImageCreationToolProps {
    model: Model;
}

export function ImageCreationTool({ model }: ImageCreationToolProps) {
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function generate() {
        if (!prompt.trim() || generating) return;
        setGenerating(true);
        setImageUrl(null);
        setError(null);
        try {
            const encoded = encodeURIComponent(prompt.trim());
            setImageUrl(`https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    }

    function removeImage() {
        setImageUrl(null);
        setError(null);
    }

    return (
        <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
            <div>
                <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Image Prompt</label>
                <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif" }} />
            </div>
            <button onClick={generate} disabled={!prompt.trim() || generating}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                style={{ background: prompt.trim() && !generating ? model.color : "rgba(255,255,255,0.07)", color: prompt.trim() && !generating ? "#000" : "rgba(255,255,255,0.25)" }}>
                {generating ? <><Typing /><span>Generating…</span></> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg><span>Generate Image</span></>}
            </button>
            {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>{error}</div>}
            {imageUrl && (
                <div className="relative inline-flex flex-col items-center">
                    <img src={imageUrl} alt="Generated image" className="max-h-96 rounded-lg object-contain" />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.4)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
