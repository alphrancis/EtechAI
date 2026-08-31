import { Dot } from "./ui/Dot";
import type { Model } from "../types";

export function EcosystemStatus({ model }: { model: Model }) {
    const rows = [
    { label: "FOUNDATION", value: "Google AI Research", active: true },
    { label: "ENGINE", value: model.name, active: true },
    { label: "API / PLATFORM", value: "Gemini API", active: true },
    { label: "SERVICE / TOOL", value: "Base Model", active: false },
    { label: "APPLICATION", value: "Web Client", active: true },
];

    return (
        <div className="mx-3 rounded-xl overflow-hidden" style={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-3.5 pt-3 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: model.color, fontFamily: "JetBrains Mono, monospace" }}>
            Google AI Ecosystem
            </p>
        </div>
        <div className="px-3.5 py-1">
            {rows.map((r) => (
            <div
                key={r.label}
                className="flex items-center justify-between py-2 gap-2 border-b last:border-0"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
                <span className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "JetBrains Mono, monospace", minWidth: 68 }}>
                {r.label}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                <Dot active={r.active} />
                <span className="text-[10px] font-medium truncate" style={{ color: r.active ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.3)" }}>
                    {r.value}
                </span>
                </div>
            </div>
            ))}
        </div>
        <div className="px-3.5 pb-3 pt-1.5 flex items-center justify-between">
            <span className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "JetBrains Mono, monospace" }}>
            System Status
            </span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.22)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 5px #4ade80" }} />
            <span className="text-[9px] font-semibold" style={{ color: "#4ade80", fontFamily: "JetBrains Mono, monospace" }}>Ready</span>
            </div>
        </div>
        </div>
    );
}