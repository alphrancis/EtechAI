import { useState, useRef, useEffect } from "react";
import type { Model } from "../types";

interface ModelPickerProps {
    selected: Model;
    models: Model[];
    onSelect: (m: Model) => void;
}

export function ModelPicker({ selected, models, onSelect }: ModelPickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function h(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

return (
        <div className="relative" ref={ref}>
        <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        >
            <span className="w-2 h-2 rounded-full" style={{ background: selected.color }} />
            <span className="font-medium text-xs">{selected.name}</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.4, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="M6 9l6 6 6-6" />
            </svg>
        </button>

        {open && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50" style={{ background: "#111820", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 24px 48px rgba(0,0,0,0.5)", animation: "fade-in 0.15s ease-out both" }}>
            <p className="px-4 pt-3 pb-1 text-[9px] tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>
                Select Model
            </p>
            {models.map((m) => (
                <button
                key={m.id}
                onClick={() => { onSelect(m); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100"
                style={{ background: selected.id === m.id ? `${m.color}14` : "transparent" }}
                onMouseEnter={(e) => { if (selected.id !== m.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (selected.id !== m.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color, opacity: selected.id === m.id ? 1 : 0.5 }} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: selected.id === m.id ? m.color : "rgba(255,255,255,0.75)" }}>{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${m.color}20`, color: m.color, fontFamily: "JetBrains Mono, monospace" }}>{m.badge}</span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{m.description}</p>
                </div>
                {selected.id === m.id && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: m.color, flexShrink: 0 }}><path d="M20 6L9 17l-5-5" /></svg>}
                </button>
            ))}
            <div className="h-2" />
            </div>
        )}
        </div>
    );
}