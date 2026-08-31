import { SliderParam } from "./ui/SliderParam";
import type { Model, Config } from "../types";

export const DEFAULT_CONFIG: Config = {
    temperature: 1.0,
    maxTokens: 8192,
    topP: 0.95,
    topK: 40,
    systemPrompt: "",
    safetyLevel: "medium",
};

interface ConfigPanelProps {
    model: Model;
    config: Config;
    setConfig: (c: Config) => void;
}

export function ConfigPanel({ model, config, setConfig }: ConfigPanelProps) {
    function set<K extends keyof Config>(k: K, v: Config[K]) {
        setConfig({ ...config, [k]: v });
    }

const safetyLevels: Config["safetyLevel"][] = ["none", "low", "medium", "high"];

    return (
        <div className="flex flex-col h-full overflow-y-auto">
        <div className="px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.28)", fontFamily: "JetBrains Mono, monospace" }}>
            Run Settings
            </p>
        </div>

        <div className="flex flex-col gap-6 px-4 py-4">
            <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>
                System Instructions
            </label>
            <textarea
                rows={4}
                value={config.systemPrompt}
                onChange={(e) => set("systemPrompt", e.target.value)}
                placeholder="Optional system prompt…"
                className="w-full rounded-xl px-3 py-2.5 text-xs resize-none outline-none leading-relaxed"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.75)", fontFamily: "Outfit, sans-serif", caretColor: model.color }}
            />
            </div>

            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            <SliderParam label="Temperature" value={config.temperature} min={0} max={2} step={0.05} onChange={(v) => set("temperature", v)} />
            <SliderParam label="Max Output Tokens" value={config.maxTokens} min={256} max={32768} step={256} onChange={(v) => set("maxTokens", v)} />
            <SliderParam label="Top-P" value={config.topP} min={0} max={1} step={0.01} onChange={(v) => set("topP", v)} />
            <SliderParam label="Top-K" value={config.topK} min={1} max={100} step={1} onChange={(v) => set("topK", v)} />

            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>
                Safety Filter
            </label>
            <div className="grid grid-cols-2 gap-1.5">
                {safetyLevels.map((l) => (
                <button
                    key={l}
                    onClick={() => set("safetyLevel", l)}
                    className="py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-100"
                    style={{
                    background: config.safetyLevel === l ? `${model.color}22` : "rgba(255,255,255,0.04)",
                    color: config.safetyLevel === l ? model.color : "rgba(255,255,255,0.4)",
                    border: config.safetyLevel === l ? `1px solid ${model.color}44` : "1px solid rgba(255,255,255,0.07)",
                    }}
                >
                    {l}
                </button>
                ))}
            </div>
            </div>

            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            <div>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>
                API Key
            </label>
            <input
                type="password"
                placeholder="AIza…"
                defaultValue=""
                className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.7)", fontFamily: "JetBrains Mono, monospace" }}
            />
            <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                Get your key at <span style={{ color: "#7c9ef8" }}>aistudio.google.com</span>
            </p>
            </div>

            <button
            onClick={() => setConfig(DEFAULT_CONFIG)}
            className="text-xs py-2 rounded-xl transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            >
            Reset to defaults
            </button>
        </div>
        </div>
    );
}