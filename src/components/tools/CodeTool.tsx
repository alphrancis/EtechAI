// src/components/tools/CodeTool.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Typing } from "../ui/Typing";
import { runCode } from "../../services/api";
import type { Model } from "../../types";

const DEFAULT_CODE = `import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel("gemini-1.5-pro")

chat = model.start_chat(history=[])
response = chat.send_message("What is machine learning?")
print(response.text)`;

interface CodeToolProps {
    model: Model;
}

let keyId = 0;
function nextKey(prefix: string) {
    return `${prefix}-${keyId++}`;
}

function formatInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    while (remaining.length > 0) {
        const codeMatch = remaining.match(/`([^`]+)`/);
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
        const matches = [
            codeMatch ? { type: "code" as const, match: codeMatch, idx: codeMatch.index! } : null,
            boldMatch ? { type: "bold" as const, match: boldMatch, idx: boldMatch.index! } : null,
            linkMatch ? { type: "link" as const, match: linkMatch, idx: linkMatch.index! } : null,
        ].filter(Boolean).sort((a, b) => a!.idx - b!.idx);
        if (matches.length === 0) { parts.push(remaining); break; }
        const first = matches[0]!;
        if (first.idx > 0) parts.push(remaining.slice(0, first.idx));
        if (first.type === "code") {
            parts.push(<code key={nextKey("c")} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.08)", color: "#a8d8a0", fontFamily: "JetBrains Mono, monospace" }}>{first.match[1]}</code>);
        } else if (first.type === "bold") {
            parts.push(<strong key={nextKey("b")} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{first.match[1]}</strong>);
        } else if (first.type === "link") {
            parts.push(<a key={nextKey("a")} href={first.match[2]} target="_blank" rel="noopener noreferrer" style={{ color: "#6bcf8e", textDecoration: "underline" }}>{first.match[1]}</a>);
        }
        remaining = remaining.slice(first.idx + first.match[0].length);
    }
    return parts;
}

function formatOutput(text: string, modelColor: string): React.ReactNode {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let tableRows: string[][] = [];
    let pendingTableKey = 0;

    function flushTable() {
        if (tableRows.length === 0) return;
        const header = tableRows[0];
        const data = tableRows.slice(1);
        const key = nextKey("tbl");
        elements.push(
            <div key={key} className="my-3 rounded-lg overflow-hidden text-[11px]" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${header.length}, 1fr)` }}>
                    {header.map((cell, ci) => (
                        <div key={ci} className="px-3 py-1.5 font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", borderRight: ci < header.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                            {formatInline(cell)}
                        </div>
                    ))}
                </div>
                {data.map((row, ri) => (
                    <div key={ri} className="grid" style={{ gridTemplateColumns: `repeat(${header.length}, 1fr)`, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {row.map((cell, ci) => (
                            <div key={ci} className="px-3 py-1.5" style={{ color: "rgba(255,255,255,0.6)", borderRight: ci < row.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                                {formatInline(cell)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
        tableRows = [];
    }

    while (i < lines.length) {
        const line = lines[i];

        // Code block toggle
        if (line.trim().startsWith("```")) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={nextKey("code")} className="rounded-lg p-3 my-2 text-[11px] overflow-x-auto whitespace-pre-wrap" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "JetBrains Mono, monospace", color: "#a8d8a0", lineHeight: 1.6 }}>
                        {codeLines.join("\n")}
                    </pre>
                );
                codeLines = [];
                inCodeBlock = false;
            } else {
                if (tableRows.length > 0) flushTable();
                inCodeBlock = true;
            }
            i++;
            continue;
        }
        if (inCodeBlock) { codeLines.push(line); i++; continue; }

        // Empty line
        if (line.trim() === "") {
            if (tableRows.length > 0) flushTable();
            elements.push(<div key={nextKey("sp")} className="h-3" />);
            i++;
            continue;
        }

        // Horizontal rule
        if (line.trim().match(/^[-*_]{3,}$/)) {
            if (tableRows.length > 0) flushTable();
            elements.push(<hr key={nextKey("hr")} className="my-3" style={{ borderColor: "rgba(255,255,255,0.08)" }} />);
            i++;
            continue;
        }

        // Table row
        if (line.trim().startsWith("|")) {
            if (line.trim().match(/^\|[\s:-]+\|$/)) { i++; continue; }
            const cells = line.split("|").filter(c => c.trim() !== "").map(c => c.trim());
            tableRows.push(cells);
            i++;
            continue;
        }

        if (tableRows.length > 0) flushTable();

        // Header
        const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            elements.push(
                <div key={nextKey("h")} className={`mt-4 mb-1.5 font-semibold ${level === 1 ? "text-sm" : level === 2 ? "text-[13px]" : "text-xs"}`} style={{ color: "rgba(255,255,255,0.9)" }}>
                    {formatInline(headerMatch[2])}
                </div>
            );
            i++;
            continue;
        }

        // Numbered list
        const numMatch = line.match(/^\s*\d+\.\s+(.+)$/);
        if (numMatch) {
            elements.push(
                <div key={nextKey("ol")} className="flex gap-2 ml-2 my-0.5">
                    <span className="text-xs font-semibold" style={{ color: modelColor, minWidth: 16 }}>{line.match(/^\s*(\d+)\./)?.[1]}.</span>
                    <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{formatInline(numMatch[1])}</span>
                </div>
            );
            i++;
            continue;
        }

        // Bullet point
        const bulletMatch = line.match(/^\s*[-*•]\s+(.+)$/);
        if (bulletMatch) {
            elements.push(
                <div key={nextKey("bl")} className="flex gap-2 ml-3 my-0.5">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: modelColor, opacity: 0.6 }} />
                    <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{formatInline(bulletMatch[1])}</span>
                </div>
            );
            i++;
            continue;
        }

        // Normal text
        elements.push(
            <p key={nextKey("p")} className="text-xs leading-relaxed my-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                {formatInline(line)}
            </p>
        );
        i++;
    }

    if (inCodeBlock && codeLines.length > 0) {
        elements.push(
            <pre key={nextKey("code")} className="rounded-lg p-3 my-2 text-[11px] overflow-x-auto whitespace-pre-wrap" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "JetBrains Mono, monospace", color: "#a8d8a0", lineHeight: 1.6 }}>
                {codeLines.join("\n")}
            </pre>
        );
    }
    if (tableRows.length > 0) flushTable();

    return <div>{elements}</div>;
}

export function CodeTool({ model }: CodeToolProps) {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showOutput, setShowOutput] = useState(false);
    const [outputHeight, setOutputHeight] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStartY = useRef(0);
    const dragStartHeight = useRef(0);
    const outputEndRef = useRef<HTMLDivElement>(null);

    async function run() {
        setRunning(true);
        setOutput("");
        setError(null);
        setShowOutput(true);
        try {
            const res = await runCode(code, model.id);
            setOutput(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setRunning(false);
        }
    }

    useEffect(() => {
        if (showOutput) outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [output, showOutput]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(output || error || "");
    }, [output, error]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        dragStartY.current = e.clientY;
        dragStartHeight.current = outputHeight;
        const onMouseMove = (ev: MouseEvent) => {
            if (!isDragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const delta = ev.clientY - dragStartY.current;
            const newHeight = Math.max(10, Math.min(90, dragStartHeight.current - (delta / rect.height) * 100));
            setOutputHeight(newHeight);
        };
        const onMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }, [outputHeight]);

    const toggleOutput = useCallback(() => {
        setShowOutput((prev) => !prev);
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono, monospace" }}>main.py</span>
                <button
                    onClick={run}
                    disabled={running}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150"
                    style={{ background: running ? "rgba(255,255,255,0.06)" : model.color, color: running ? "rgba(255,255,255,0.3)" : "#000" }}
                >
                    {running ? <><Typing /><span> Running…</span></> : <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg> Run</>}
                </button>
            </div>

            <div className="flex-1 relative overflow-hidden" ref={containerRef}>
                {/* Code editor */}
                <div className="absolute inset-0 flex flex-col"
                    style={{ height: showOutput ? `${100 - outputHeight}%` : "100%", transition: "height 0.15s" }}>
                    <div className="px-4 py-2 border-b flex items-center gap-2 flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        {output && !error && (
                            <button onClick={handleCopy} className="ml-auto text-[9px] px-2 py-0.5 rounded transition-colors"
                                style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                title="Copy output">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                {" "}Copy
                            </button>
                        )}
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-transparent resize-none outline-none text-xs p-4 leading-relaxed"
                        style={{ color: "#a8d8a0", fontFamily: "JetBrains Mono, monospace", caretColor: model.color }}
                    />
                    {output && !showOutput && (
                        <div className="flex-shrink-0 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                            <button onClick={toggleOutput}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium transition-all duration-150"
                                style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.2)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: "rotate(180deg)" }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                                Show Output
                            </button>
                        </div>
                    )}
                </div>

                {/* Output panel */}
                {showOutput && (
                    <>
                        {/* Drag handle */}
                        <div className="absolute left-0 right-0 h-2 flex items-center justify-center cursor-ns-resize"
                            style={{ top: `${100 - outputHeight}%`, zIndex: 10, marginTop: -4 }}
                            onMouseDown={handleMouseDown}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                            onMouseLeave={(e) => { if (!isDragging.current) e.currentTarget.style.background = "transparent"; }}>
                            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                        </div>

                        {/* Output content */}
                        <div className="absolute left-0 right-0 bottom-0 flex flex-col overflow-hidden"
                            style={{ height: `${outputHeight}%` }}>
                            <div className="px-4 py-2 border-b flex items-center gap-2 flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#6bcf8e" }}><circle cx="12" cy="12" r="10" /></svg>
                                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}>output</span>
                                <button onClick={toggleOutput} className="ml-auto text-[9px] px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                                    style={{ color: "#3b82f6", background: "rgba(59,130,246,0.1)" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.2)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; }}>
                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    Hide
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4" style={{ background: "rgba(0,0,0,0.15)" }}>
                                {running ? (
                                    <div className="flex items-center gap-2"><Typing /><span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace" }}>executing…</span></div>
                                ) : error ? (
                                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "#fca5a5", fontFamily: "JetBrains Mono, monospace" }}>{error}</pre>
                                ) : (
                                    <div style={{ fontFamily: "Outfit, sans-serif" }}>
                                        {formatOutput(output, model.color)}
                                    </div>
                                )}
                                <div ref={outputEndRef} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
