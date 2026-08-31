    // src/components/tools/CodeTool.tsx
    import { useState } from "react";
    import { Typing } from "../ui/Typing";
    import { runCode } from "../../services/api";
    import type { Model } from "../../types";

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

    interface CodeToolProps {
    model: Model;
    }

    export function CodeTool({ model }: CodeToolProps) {
    const [sample, setSample] = useState<keyof typeof CODE_SAMPLES>("chat");
    const [code, setCode] = useState(CODE_SAMPLES.chat);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tabs: { key: keyof typeof CODE_SAMPLES; label: string }[] = [
        { key: "chat", label: "Chat" },
        { key: "vision", label: "Vision" },
        { key: "stream", label: "Streaming" },
        { key: "embed", label: "Embeddings" },
    ];

    function selectSample(k: keyof typeof CODE_SAMPLES) {
        setSample(k);
        setCode(CODE_SAMPLES[k]);
        setOutput("");
    }

    async function run() {
        setRunning(true);
        setOutput("");
        setError(null);
        try {
        const res = await runCode(code, model.id);
        setOutput(res);
        } catch (err: any) {
        setError(err.message);
        } finally {
        setRunning(false);
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
        <div className="flex gap-1 px-5 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {tabs.map((t) => (
            <button
                key={t.key}
                onClick={() => selectSample(t.key)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-100"
                style={{
                background: sample === t.key ? `${model.color}22` : "transparent",
                color: sample === t.key ? model.color : "rgba(255,255,255,0.4)",
                border: sample === t.key ? `1px solid ${model.color}44` : "1px solid transparent",
                }}
            >
                {t.label}
            </button>
            ))}
            <button
            onClick={run}
            disabled={running}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150"
            style={{ background: running ? "rgba(255,255,255,0.06)" : model.color, color: running ? "rgba(255,255,255,0.3)" : "#000" }}
            >
            {running ? "Running…" : <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg> Run</>}
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#f0c84a" }}><circle cx="12" cy="12" r="10" /></svg>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>main.py</span>
            </div>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent resize-none outline-none text-xs p-4 leading-relaxed"
                style={{ color: "#a8d8a0", fontFamily: "JetBrains Mono, monospace", caretColor: model.color }}
            />
            </div>
            <div className="w-64 flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#6bcf8e" }}><circle cx="12" cy="12" r="10" /></svg>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>output</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {running ? (
                <div className="flex items-center gap-2"><Typing /><span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>executing…</span></div>
                ) : error ? (
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "#fca5a5", fontFamily: "JetBrains Mono, monospace" }}>{error}</pre>
                ) : output ? (
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "JetBrains Mono, monospace" }}>{output}</pre>
                ) : (
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>Run code to see output</p>
                )}
            </div>
            </div>
        </div>
        </div>
    );
    }