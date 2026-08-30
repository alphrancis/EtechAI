import { useState, useRef, useEffect, useCallback } from "react";

/* ── Types ───────────────────────────────────────────────────── */
interface Model { id: string; name: string; badge: string; color: string; description: string; }
type Role = "user" | "ai" | "system";
interface Message { id: number; role: Role; text: string; timestamp: string; }
type Tool = "chat" | "prompt" | "vision" | "code" | "embeddings";

/* ── Models ──────────────────────────────────────────────────── */
const MODELS: Model[] = [
  { id: "gemini-2.0-flash",   name: "Gemini 2.0 Flash",   badge: "Latest",       color: "#7c9ef8", description: "Fast multimodal reasoning" },
  { id: "gemini-1.5-pro",     name: "Gemini 1.5 Pro",     badge: "Recommended",  color: "#6bcf8e", description: "Balanced, 1M context window" },
  { id: "gemini-1.5-flash",   name: "Gemini 1.5 Flash",   badge: "Fastest",      color: "#f0c84a", description: "Optimized for speed" },
  { id: "gemini-ultra",       name: "Gemini Ultra",       badge: "Most Capable", color: "#c084fc", description: "Highest reasoning capability" },
  { id: "text-embedding-004", name: "Text Embedding 004", badge: "Embeddings",   color: "#f07a6b", description: "Semantic text embeddings" },
];

/* ── Simulated AI responses ───────────────────────────────────── */
const RESPONSES: Record<string, string> = {
  default:    "The Google AI Digital Ecosystem integrates Gemini models, Vertex AI, and developer APIs into a unified intelligence layer — enabling real-time reasoning, multimodal understanding, and seamless API orchestration across cloud and edge.",
  gemini:     "Gemini is Google's most capable multimodal model family. It reasons across text, images, audio, video, and code simultaneously — with context windows exceeding 1M tokens, ideal for deep document analysis and long-horizon reasoning tasks.",
  search:     "Google AI Search uses LLMs to synthesize billions of sources into conversational, cited answers — shifting from link-ranking to knowledge synthesis and fundamentally changing how people interact with information.",
  vertex:     "Vertex AI is Google Cloud's unified ML platform for building, deploying, and scaling models at enterprise grade — with managed infrastructure for fine-tuning, AutoML pipelines, and global prediction serving.",
  tensorflow: "TensorFlow spans the full AI deployment spectrum: TFX for production pipelines, TF Lite for mobile, and TF.js for browser inference. It remains the backbone of Google's open-source machine learning ecosystem.",
  api:        "The Gemini API provides programmatic access to Google's most capable models. With REST and SDK support across Python, Node.js, Go, and more — you can build chat apps, document processors, and multimodal pipelines in minutes.",
  code:       "Here's a Python example using the Gemini API:\n\n```python\nimport google.generativeai as genai\n\ngenai.configure(api_key=\"YOUR_API_KEY\")\nmodel = genai.GenerativeModel(\"gemini-1.5-pro\")\n\nresponse = model.generate_content(\"Explain neural networks\")\nprint(response.text)\n```",
};

function getResponse(input: string) {
  const s = input.toLowerCase();
  if (s.includes("gemini") || s.includes("bard"))                       return RESPONSES.gemini;
  if (s.includes("search") || s.includes("sge"))                        return RESPONSES.search;
  if (s.includes("vertex") || s.includes("cloud"))                      return RESPONSES.vertex;
  if (s.includes("tensorflow") || s.includes("ml") || s.includes("model")) return RESPONSES.tensorflow;
  if (s.includes("api") || s.includes("key") || s.includes("sdk"))     return RESPONSES.api;
  if (s.includes("code") || s.includes("python") || s.includes("example")) return RESPONSES.code;
  return RESPONSES.default;
}

function ts() { return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }

const SEED: Message[] = [{
  id: 1, role: "ai",
  text: "Welcome to the Google AI Open Platform. I'm powered by Gemini. Ask me anything — or switch tools using the left panel to explore Prompt Builder, Vision analysis, Code execution, and Embeddings.",
  timestamp: ts(),
}];

/* ── Small shared components ─────────────────────────────────── */
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="url(#lp)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="16" cy="16" r="5" fill="url(#lp2)" />
      <circle cx="16" cy="4"  r="2.2" fill="#7c9ef8" /><circle cx="28" cy="16" r="2.2" fill="#6bcf8e" />
      <circle cx="16" cy="28" r="2.2" fill="#f07a6b" /><circle cx="4"  cy="16" r="2.2" fill="#f0c84a" />
      <defs>
        <linearGradient id="lp" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c9ef8" /><stop offset="0.5" stopColor="#6bcf8e" /><stop offset="1" stopColor="#f07a6b" />
        </linearGradient>
        <radialGradient id="lp2" cx="50%" cy="50%" r="50%">
          <stop stopColor="#b3ccfd" /><stop offset="1" stopColor="#7c9ef8" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function Dot({ active, color }: { active: boolean; color?: string }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: active ? (color ?? "#4ade80") : "rgba(255,255,255,0.15)", boxShadow: active ? `0 0 6px ${color ?? "#4ade80"}88` : "none" }} />;
}

function Typing() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "rgba(255,255,255,0.3)", animation: `typing-dot 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
    </div>
  );
}

function SliderParam({ label, value, min, max, step, unit = "", onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "JetBrains Mono, monospace" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "#7c9ef8", background: `linear-gradient(to right, #7c9ef8 ${((value-min)/(max-min))*100}%, rgba(255,255,255,0.1) 0%)` }} />
      <div className="flex justify-between">
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>{min}</span>
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>{max}</span>
      </div>
    </div>
  );
}

/* ── Ecosystem status ─────────────────────────────────────────── */
function EcosystemStatus({ model }: { model: Model }) {
  const rows = [
    { label: "FOUNDATION",      value: "Google AI Research", active: true },
    { label: "ENGINE",          value: model.name,           active: true },
    { label: "API / PLATFORM",  value: "Gemini API",         active: true },
    { label: "SERVICE / TOOL",  value: "Base Model",         active: false },
    { label: "APPLICATION",     value: "Web Client",         active: true },
  ];
  return (
    <div className="mx-3 rounded-xl overflow-hidden" style={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="px-3.5 pt-3 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: model.color, fontFamily: "JetBrains Mono, monospace" }}>Google AI Ecosystem</p>
      </div>
      <div className="px-3.5 py-1">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between py-2 gap-2 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <span className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "JetBrains Mono, monospace", minWidth: 68 }}>{r.label}</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <Dot active={r.active} />
              <span className="text-[10px] font-medium truncate" style={{ color: r.active ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.3)" }}>{r.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-3.5 pb-3 pt-1.5 flex items-center justify-between">
        <span className="text-[8px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "JetBrains Mono, monospace" }}>System Status</span>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.22)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 5px #4ade80" }} />
          <span className="text-[9px] font-semibold" style={{ color: "#4ade80", fontFamily: "JetBrains Mono, monospace" }}>Ready</span>
        </div>
      </div>
    </div>
  );
}

/* ── Chat tool ────────────────────────────────────────────────── */
function ChatTool({ model, config }: { model: Model; config: Config }) {
  const [messages, setMessages] = useState<Message[]>(SEED);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  function send(text: string) {
    const t = text.trim(); if (!t || typing) return;
    setMessages(p => [...p, { id: Date.now(), role: "user", text: t, timestamp: ts() }]);
    setInput(""); if (taRef.current) taRef.current.style.height = "auto";
    setTyping(true);
    const delay = model.id === "gemini-1.5-flash" ? 800 : model.id === "gemini-ultra" ? 2000 : 1300;
    setTimeout(() => {
      setMessages(p => [...p, { id: Date.now()+1, role: "ai", text: config.systemPrompt ? `[System: "${config.systemPrompt.slice(0,40)}…"] ${getResponse(t)}` : getResponse(t), timestamp: ts() }]);
      setTyping(false);
    }, delay + Math.random() * 400);
  }

  const suggestions = ["What is the Gemini API?", "Show me a Python example", "Explain Vertex AI", "How does TensorFlow work?"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {messages.length === 1 && (
          <div className="flex flex-col items-center text-center gap-4 mt-6 mb-2">
            <LogoMark size={44} />
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>Chat with {model.name}</h2>
              <p className="text-sm max-w-xs" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>Ask anything about the Google AI ecosystem, get code examples, or explore capabilities.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs px-3.5 py-2 rounded-xl transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => {
          const isAI = msg.role === "ai";
          const hasCode = msg.text.includes("```");
          const parts = hasCode ? msg.text.split(/(```[\s\S]*?```)/g) : null;
          return (
            <div key={msg.id} className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`} style={{ animation: "slide-up 0.22s ease-out both" }}>
              {isAI ? <div className="flex-shrink-0 mt-0.5"><LogoMark size={26} /></div>
                    : <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-black" style={{ background: model.color }}>U</div>}
              <div className={`flex flex-col gap-1 max-w-[78%] ${isAI ? "" : "items-end"}`}>
                {isAI && <span className="text-[10px] ml-0.5" style={{ color: "rgba(255,255,255,0.28)", fontFamily: "JetBrains Mono, monospace" }}>Gemini</span>}
                <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={isAI ? { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.85)" }
                              : { background: `${model.color}20`, border: `1px solid ${model.color}44`, color: "rgba(255,255,255,0.88)" }}>
                  {hasCode && parts ? parts.map((p, i) => {
                    if (p.startsWith("```")) {
                      const code = p.replace(/```\w*\n?/, "").replace(/```$/, "");
                      return <pre key={i} className="rounded-lg p-3 mt-2 mb-1 text-xs overflow-x-auto" style={{ background: "rgba(0,0,0,0.4)", color: "#a8d8a0", fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6 }}>{code}</pre>;
                    }
                    return <span key={i}>{p}</span>;
                  }) : msg.text}
                </div>
                <span className="text-[10px] mx-0.5" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "JetBrains Mono, monospace" }}>{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex items-center gap-3" style={{ animation: "slide-up 0.22s ease-out both" }}>
            <div className="flex-shrink-0"><LogoMark size={26} /></div>
            <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}><Typing /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Token count hint */}
      <div className="px-6 pb-1 flex justify-end">
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "JetBrains Mono, monospace" }}>
          {messages.reduce((a, m) => a + m.text.split(" ").length, 0)} tokens · {config.maxTokens} max
        </span>
      </div>

      {/* Input */}
      <div className="px-5 pb-5 flex-shrink-0">
        <div className="flex items-end gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <textarea ref={taRef} rows={1} value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Type a message…"
            className="flex-1 bg-transparent resize-none text-sm outline-none leading-relaxed"
            style={{ color: "rgba(255,255,255,0.85)", caretColor: model.color, fontFamily: "Outfit, sans-serif", minHeight: 22 }} />
          <button onClick={() => send(input)} disabled={!input.trim() || typing}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{ background: input.trim() && !typing ? model.color : "rgba(255,255,255,0.06)", color: input.trim() && !typing ? "#000" : "rgba(255,255,255,0.2)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.14)", fontFamily: "JetBrains Mono, monospace" }}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

/* ── Prompt Builder tool ──────────────────────────────────────── */
function PromptTool({ model }: { model: Model }) {
  const [system, setSystem] = useState("You are a helpful Google AI expert assistant. Answer concisely and accurately.");
  const [userMsg, setUser] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  function run() {
    if (!userMsg.trim() || running) return;
    setRunning(true); setOutput("");
    setTimeout(() => {
      setOutput(getResponse(userMsg));
      setRunning(false);
    }, 1400);
  }

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
      <div>
        <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>System Instructions</label>
        <textarea rows={3} value={system} onChange={e => setSystem(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none leading-relaxed"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif", caretColor: model.color }} />
      </div>
      <div>
        <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>User Prompt</label>
        <textarea rows={5} value={userMsg} onChange={e => setUser(e.target.value)}
          placeholder="Write your prompt here…"
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none leading-relaxed"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif", caretColor: model.color }} />
      </div>
      <button onClick={run} disabled={!userMsg.trim() || running}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
        style={{ background: userMsg.trim() && !running ? model.color : "rgba(255,255,255,0.07)", color: userMsg.trim() && !running ? "#000" : "rgba(255,255,255,0.25)" }}>
        {running ? <><Typing /><span>Generating…</span></> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3" /></svg><span>Run Prompt</span></>}
      </button>
      {output && (
        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Output</label>
          <div className="rounded-xl px-4 py-4 text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.82)" }}>{output}</div>
        </div>
      )}
    </div>
  );
}

/* ── Vision tool ─────────────────────────────────────────────── */
function VisionTool({ model }: { model: Model }) {
  const [prompt, setPrompt] = useState("Describe this image in detail.");
  const [preview, setPreview] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setPreview(ev.target?.result as string); r.readAsDataURL(f);
  }

  function analyze() {
    if (!preview || running) return; setRunning(true); setOutput("");
    setTimeout(() => { setOutput("The uploaded image has been analyzed by " + model.name + ". This is a demonstration — in production the Gemini Vision API would process the actual image pixels and return detailed descriptions, object detection results, OCR text extraction, and semantic understanding based on your prompt."); setRunning(false); }, 1800);
  }

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
      <div>
        <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Upload Image</label>
        <div onClick={() => fileRef.current?.click()}
          className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-all duration-150"
          style={{ borderColor: preview ? `${model.color}66` : "rgba(255,255,255,0.1)", background: preview ? `${model.color}08` : "rgba(255,255,255,0.02)" }}>
          {preview ? <img src={preview} alt="upload preview" className="max-h-40 rounded-lg object-contain" /> : <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(255,255,255,0.25)" }}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Click to upload image</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>PNG, JPG, WEBP, GIF supported</span>
          </>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
      <div>
        <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Analysis Prompt</label>
        <textarea rows={2} value={prompt} onChange={e => setPrompt(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)", fontFamily: "Outfit, sans-serif" }} />
      </div>
      <button onClick={analyze} disabled={!preview || running}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
        style={{ background: preview && !running ? model.color : "rgba(255,255,255,0.07)", color: preview && !running ? "#000" : "rgba(255,255,255,0.25)" }}>
        {running ? <><Typing /><span>Analyzing…</span></> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg><span>Analyze Image</span></>}
      </button>
      {output && <div className="rounded-xl px-4 py-4 text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.82)" }}>{output}</div>}
    </div>
  );
}

/* ── Code Execution tool ─────────────────────────────────────── */
const CODE_SAMPLES: Record<string, string> = {
  chat: `import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-1.5-pro")

chat = model.start_chat(history=[])
response = chat.send_message("What is machine learning?")
print(response.text)`,
  vision: `import google.generativeai as genai
import PIL.Image

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-1.5-pro-vision")

image = PIL.Image.open("photo.jpg")
response = model.generate_content(["Describe this image", image])
print(response.text)`,
  stream: `import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-1.5-flash")

response = model.generate_content(
    "Write a short story about AI",
    stream=True
)
for chunk in response:
    print(chunk.text, end="", flush=True)`,
  embed: `import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

result = genai.embed_content(
    model="models/text-embedding-004",
    content="Google AI is transforming technology",
    task_type="retrieval_document"
)
print(result["embedding"][:5])  # First 5 dimensions`,
};

function CodeTool({ model }: { model: Model }) {
  const [sample, setSample] = useState<keyof typeof CODE_SAMPLES>("chat");
  const [code, setCode] = useState(CODE_SAMPLES.chat);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const tabs: { key: keyof typeof CODE_SAMPLES; label: string }[] = [
    { key: "chat", label: "Chat" }, { key: "vision", label: "Vision" },
    { key: "stream", label: "Streaming" }, { key: "embed", label: "Embeddings" },
  ];

  function selectSample(k: keyof typeof CODE_SAMPLES) { setSample(k); setCode(CODE_SAMPLES[k]); setOutput(""); }

  function run() {
    setRunning(true); setOutput("");
    setTimeout(() => {
      setOutput(`# Simulated output (${model.name})\n\n✓ API key configured\n✓ Model initialized: ${model.id}\n✓ Request sent\n\n> Response received in 342ms\n> Tokens used: 187 input, 64 output\n\n"Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed..."\n\nStatus: 200 OK`);
      setRunning(false);
    }, 1600);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => selectSample(t.key)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-100"
            style={{ background: sample === t.key ? `${model.color}22` : "transparent", color: sample === t.key ? model.color : "rgba(255,255,255,0.4)", border: sample === t.key ? `1px solid ${model.color}44` : "1px solid transparent" }}>
            {t.label}
          </button>
        ))}
        <button onClick={run} disabled={running}
          className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150"
          style={{ background: running ? "rgba(255,255,255,0.06)" : model.color, color: running ? "rgba(255,255,255,0.3)" : "#000" }}>
          {running ? "Running…" : <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg> Run</>}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#f0c84a" }}><circle cx="12" cy="12" r="10" /></svg>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>main.py</span>
          </div>
          <textarea value={code} onChange={e => setCode(e.target.value)}
            className="flex-1 bg-transparent resize-none outline-none text-xs p-4 leading-relaxed"
            style={{ color: "#a8d8a0", fontFamily: "JetBrains Mono, monospace", caretColor: model.color }} />
        </div>
        {/* Output */}
        <div className="w-64 flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#6bcf8e" }}><circle cx="12" cy="12" r="10" /></svg>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>output</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {running ? <div className="flex items-center gap-2"><Typing /><span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>executing…</span></div>
              : output ? <pre className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "JetBrains Mono, monospace" }}>{output}</pre>
              : <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>Run code to see output</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Embeddings tool ─────────────────────────────────────────── */
function EmbeddingsTool({ model }: { model: Model }) {
  const [textA, setTextA] = useState("Google Gemini is a powerful multimodal AI model.");
  const [textB, setTextB] = useState("Gemini can understand text, images, audio, and video.");
  const [result, setResult] = useState<{ vecA: number[]; vecB: number[]; sim: number } | null>(null);
  const [running, setRunning] = useState(false);

  function embed() {
    setRunning(true); setResult(null);
    setTimeout(() => {
      const vecA = Array.from({ length: 8 }, () => parseFloat((Math.random() * 2 - 1).toFixed(4)));
      const vecB = vecA.map(v => parseFloat((v + (Math.random() * 0.4 - 0.2)).toFixed(4)));
      const dot = vecA.reduce((s, v, i) => s + v * vecB[i], 0);
      const magA = Math.sqrt(vecA.reduce((s, v) => s + v * v, 0));
      const magB = Math.sqrt(vecB.reduce((s, v) => s + v * v, 0));
      const sim = parseFloat((dot / (magA * magB)).toFixed(4));
      setResult({ vecA, vecB, sim }); setRunning(false);
    }, 1400);
  }

  return (
    <div className="flex flex-col h-full p-5 gap-4 overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        {[{ label: "Text A", val: textA, set: setTextA }, { label: "Text B", val: textB, set: setTextB }].map(({ label, val, set }) => (
          <div key={label}>
            <label className="text-[10px] tracking-widest uppercase font-semibold block mb-1.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>{label}</label>
            <textarea rows={3} value={val} onChange={e => set(e.target.value)}
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
      {result && (
        <div className="flex flex-col gap-3">
          {[{ label: "Vector A (768-dim, showing first 8)", vec: result.vecA }, { label: "Vector B (768-dim, showing first 8)", vec: result.vecB }].map(({ label, vec }) => (
            <div key={label}>
              <p className="text-[10px] tracking-widest uppercase font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>{label}</p>
              <div className="rounded-xl p-3 flex flex-wrap gap-1.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {vec.map((v, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: v > 0 ? "#6bcf8e" : "#f07a6b", fontFamily: "JetBrains Mono, monospace" }}>{v}</span>)}
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
              <p className="text-[10px]" style={{ color: result.sim > 0.8 ? "#6bcf8e" : result.sim > 0.5 ? "#f0c84a" : "#f07a6b" }}>{result.sim > 0.8 ? "Very similar" : result.sim > 0.5 ? "Moderately similar" : "Dissimilar"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Config (right panel) ─────────────────────────────────────── */
interface Config { temperature: number; maxTokens: number; topP: number; topK: number; systemPrompt: string; safetyLevel: "none" | "low" | "medium" | "high"; }
const DEFAULT_CONFIG: Config = { temperature: 1.0, maxTokens: 8192, topP: 0.95, topK: 40, systemPrompt: "", safetyLevel: "medium" };

function ConfigPanel({ model, config, setConfig }: { model: Model; config: Config; setConfig: (c: Config) => void }) {
  function set<K extends keyof Config>(k: K, v: Config[K]) { setConfig({ ...config, [k]: v }); }
  const safetyLevels: Config["safetyLevel"][] = ["none", "low", "medium", "high"];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.28)", fontFamily: "JetBrains Mono, monospace" }}>Run Settings</p>
      </div>

      <div className="flex flex-col gap-6 px-4 py-4">
        {/* System prompt */}
        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>System Instructions</label>
          <textarea rows={4} value={config.systemPrompt} onChange={e => set("systemPrompt", e.target.value)}
            placeholder="Optional system prompt…"
            className="w-full rounded-xl px-3 py-2.5 text-xs resize-none outline-none leading-relaxed"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.75)", fontFamily: "Outfit, sans-serif", caretColor: model.color }} />
        </div>

        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Sliders */}
        <SliderParam label="Temperature" value={config.temperature} min={0} max={2} step={0.05} onChange={v => set("temperature", v)} />
        <SliderParam label="Max Output Tokens" value={config.maxTokens} min={256} max={32768} step={256} onChange={v => set("maxTokens", v)} />
        <SliderParam label="Top-P" value={config.topP} min={0} max={1} step={0.01} onChange={v => set("topP", v)} />
        <SliderParam label="Top-K" value={config.topK} min={1} max={100} step={1} onChange={v => set("topK", v)} />

        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Safety */}
        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>Safety Filter</label>
          <div className="grid grid-cols-2 gap-1.5">
            {safetyLevels.map(l => (
              <button key={l} onClick={() => set("safetyLevel", l)}
                className="py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-100"
                style={{
                  background: config.safetyLevel === l ? `${model.color}22` : "rgba(255,255,255,0.04)",
                  color: config.safetyLevel === l ? model.color : "rgba(255,255,255,0.4)",
                  border: config.safetyLevel === l ? `1px solid ${model.color}44` : "1px solid rgba(255,255,255,0.07)",
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* API key */}
        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold block mb-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>API Key</label>
          <input type="password" placeholder="AIza…" defaultValue=""
            className="w-full rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.7)", fontFamily: "JetBrains Mono, monospace" }} />
          <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>Get your key at <span style={{ color: "#7c9ef8" }}>aistudio.google.com</span></p>
        </div>

        {/* Reset */}
        <button onClick={() => setConfig(DEFAULT_CONFIG)}
          className="text-xs py-2 rounded-xl transition-all duration-150"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

/* ── Model dropdown ───────────────────────────────────────────── */
function ModelPicker({ selected, onSelect }: { selected: Model; onSelect: (m: Model) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all duration-150"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.8)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
        <span className="w-2 h-2 rounded-full" style={{ background: selected.color }} />
        <span className="font-medium text-xs">{selected.name}</span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.4, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50" style={{ background: "#111820", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 24px 48px rgba(0,0,0,0.5)", animation: "fade-in 0.15s ease-out both" }}>
          <p className="px-4 pt-3 pb-1 text-[9px] tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>Select Model</p>
          {MODELS.map(m => (
            <button key={m.id} onClick={() => { onSelect(m); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100"
              style={{ background: selected.id === m.id ? `${m.color}14` : "transparent" }}
              onMouseEnter={e => { if (selected.id !== m.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (selected.id !== m.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
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

/* ── Root app ─────────────────────────────────────────────────── */
const NAV_TOOLS: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "chat",       label: "Chat",           icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { id: "prompt",     label: "Prompt Builder", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg> },
  { id: "vision",     label: "Vision",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> },
  { id: "code",       label: "Code Execution", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg> },
  { id: "embeddings", label: "Embeddings",     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg> },
];

export default function App() {
  const [tool, setTool]       = useState<Tool>("chat");
  const [model, setModel]     = useState<Model>(MODELS[1]);
  const [config, setConfig]   = useState<Config>(DEFAULT_CONFIG);
  const [sidebar, setSidebar] = useState(true);
  const [rightPanel, setRightPanel] = useState(true);

  const toolTitle = NAV_TOOLS.find(t => t.id === tool)?.label ?? "";

  return (
    <div className="size-full flex overflow-hidden" style={{ background: "#0d1117", color: "rgba(255,255,255,0.85)", fontFamily: "Outfit, sans-serif" }}>

      {/* ── Left sidebar ── */}
      {sidebar && (
        <aside className="w-56 flex flex-col flex-shrink-0 border-r" style={{ background: "#0a0e14", borderColor: "rgba(255,255,255,0.06)" }}>
          {/* Brand */}
          <div className="px-4 py-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <LogoMark size={28} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>Google AI</p>
              <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.28)", fontFamily: "JetBrains Mono, monospace" }}>Open Platform</p>
            </div>
          </div>

          {/* Nav tools */}
          <nav className="flex flex-col gap-0.5 px-3 py-3">
            <p className="text-[9px] tracking-widest uppercase px-2 mb-1.5 font-semibold" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>Tools</p>
            {NAV_TOOLS.map(t => (
              <button key={t.id} onClick={() => setTool(t.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-100"
                style={{
                  background: tool === t.id ? `rgba(255,255,255,0.07)` : "transparent",
                  color: tool === t.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.42)",
                  borderLeft: tool === t.id ? `2px solid ${model.color}` : "2px solid transparent",
                }}
                onMouseEnter={e => { if (tool !== t.id) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; } }}
                onMouseLeave={e => { if (tool !== t.id) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.42)"; } }}>
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="mx-3 my-2 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* Ecosystem status */}
          <EcosystemStatus model={model} />

          {/* Footer */}
          <div className="mt-auto px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px #34d399" }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>Connected</span>
            </div>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)", fontFamily: "JetBrains Mono, monospace" }}>{model.name} · v2.1</p>
          </div>
        </aside>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0" style={{ background: "#0d1117", borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={() => setSidebar(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{toolTitle}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ModelPicker selected={model} onSelect={setModel} />
            <button onClick={() => setRightPanel(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-100"
              style={{ background: rightPanel ? "rgba(255,255,255,0.07)" : "transparent", color: rightPanel ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)" }}
              title="Toggle settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {tool === "chat"       && <ChatTool model={model} config={config} />}
            {tool === "prompt"     && <PromptTool model={model} />}
            {tool === "vision"     && <VisionTool model={model} />}
            {tool === "code"       && <CodeTool model={model} />}
            {tool === "embeddings" && <EmbeddingsTool model={model} />}
          </div>

          {/* Right config panel */}
          {rightPanel && (
            <aside className="w-64 flex-shrink-0 border-l overflow-hidden" style={{ background: "#0a0e14", borderColor: "rgba(255,255,255,0.06)" }}>
              <ConfigPanel model={model} config={config} setConfig={setConfig} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
