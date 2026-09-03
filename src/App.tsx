// src/App.tsx
import { useState, useEffect, useRef } from "react";
import { LogoMark } from "./components/ui/LogoMark";
import { EcosystemStatus } from "./components/EcosystemStatus";
import { ConfigPanel, DEFAULT_CONFIG } from "./components/ConfigPanel";
import { ModelPicker } from "./components/ModelPicker";
import { ChatTool } from "./components/tools/ChatTool";
import { PromptTool } from "./components/tools/PromptTool";
import { VisionTool } from "./components/tools/VisionTool";
import { ImageCreationTool } from "./components/tools/ImageCreationTool";
import { CodeTool } from "./components/tools/CodeTool";
import { useModels } from "./hooks/useModels";
import type { Tool, Config, Model } from "./types";

const POLLINATIONS_MODEL: Model = {
  id: "pollinations/flux",
  name: "Flux (Pollinations)",
  badge: "Free",
  color: "#a855f7",
  description: "Pollinations FLUX — no API key needed",
};

const NAV_TOOLS: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "chat", label: "Chat", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { id: "prompt", label: "Prompt Builder", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> },
  { id: "vision", label: "Vision", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
  { id: "code", label: "Code Execution", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> },
  { id: "image-creation", label: "Image Creation", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg> },
];

export default function App() {
  const [tool, setTool] = useState<Tool>("chat");
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [sidebar, setSidebar] = useState(true);
  const [rightPanel, setRightPanel] = useState(false);

  const { models, selected, setSelected, loading, error } = useModels();
  const prevModelRef = useRef<Model | null>(null);

  useEffect(() => {
    if (tool === "image-creation") {
      prevModelRef.current = selected;
      setSelected(POLLINATIONS_MODEL);
    } else if (prevModelRef.current && selected?.id === "pollinations/flux") {
      setSelected(prevModelRef.current);
      prevModelRef.current = null;
    }
  }, [tool]);

  const toolTitle = NAV_TOOLS.find((t) => t.id === tool)?.label ?? "";

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: "#0d1117", color: "rgba(255,255,255,0.5)" }}>
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={40} />
          <p className="text-sm">Loading models…</p>
        </div>
      </div>
    );
  }

  if (error || !selected) {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: "#0d1117", color: "#fca5a5" }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Failed to load models</p>
          <p className="text-sm opacity-70">{error}</p>
          <p className="text-xs mt-4 opacity-40">Make sure your Python backend is running on port 8000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex overflow-hidden" style={{ background: "#0d1117", color: "rgba(255,255,255,0.85)", fontFamily: "Outfit, sans-serif" }}>

      {/* ── Left sidebar ── */}
      {sidebar && (
        <aside className="w-56 flex flex-col flex-shrink-0 border-r" style={{ background: "#0a0e14", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="px-4 py-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <LogoMark size={28} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>Google AI</p>
              <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.28)", fontFamily: "JetBrains Mono, monospace" }}>Open Platform</p>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5 px-3 py-3">
            <p className="text-[9px] tracking-widest uppercase px-2 mb-1.5 font-semibold" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>Tools</p>
            {NAV_TOOLS.map((t) => (
              <button key={t.id} onClick={() => setTool(t.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-100"
                style={{
                  background: tool === t.id ? `rgba(255,255,255,0.07)` : "transparent",
                  color: tool === t.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.42)",
                  borderLeft: tool === t.id ? `2px solid ${selected.color}` : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (tool !== t.id) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; } }}
                onMouseLeave={(e) => { if (tool !== t.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.42)"; } }}>
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="mx-3 my-2 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
          <EcosystemStatus model={selected} />

          <div className="mt-auto px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px #34d399" }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>Connected</span>
            </div>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "JetBrains Mono, monospace" }}>{selected.name} · v2.1</p>
          </div>
        </aside>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0" style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={() => setSidebar((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{toolTitle}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ModelPicker selected={selected} models={models} onSelect={setSelected} />
            <button onClick={() => setRightPanel((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100"
              style={{ background: rightPanel ? "rgba(255,255,255,0.07)" : "transparent", color: rightPanel ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}
              title="Toggle settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {tool === "chat" && <ChatTool model={selected} config={config} />}
            {tool === "prompt" && <PromptTool model={selected} />}
            {tool === "vision" && <VisionTool model={selected} />}
            {tool === "code" && <CodeTool model={selected} />}
            {tool === "image-creation" && <ImageCreationTool model={selected} />}
          </div>

          {rightPanel && (
            <aside className="w-64 flex-shrink-0 border-l overflow-hidden" style={{ background: "#0a0e14", borderColor: "rgba(255,255,255,0.06)" }}>
              <ConfigPanel model={selected} config={config} setConfig={setConfig} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}