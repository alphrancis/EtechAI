import type { ChatSession } from "../hooks/useChatHistory";
import type { Tool } from "../types";

const TOOL_ICONS: Record<Tool, React.ReactNode> = {
    chat: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    prompt: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    vision: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    code: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    "image-creation": <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
};

const TOOL_COLORS: Record<Tool, string> = {
    chat: "#60a5fa",
    prompt: "#a78bfa",
    vision: "#34d399",
    code: "#fb923c",
    "image-creation": "#f472b6",
};

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

interface Props {
    sessions: ChatSession[];
    activeId: string | null;
    onSelect: (session: ChatSession) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}

export function ChatHistory({ sessions, activeId, onSelect, onDelete, onClear }: Props) {
    if (sessions.length === 0) {
        return (
        <div className="px-4 py-3">
            <p className="text-[9px] tracking-widest uppercase font-semibold mb-2" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>History</p>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.18)" }}>No sessions yet.</p>
        </div>
        );
    }

    return (
        <div className="px-3 py-2 flex flex-col gap-0.5">
        <div className="flex items-center justify-between px-2 mb-1">
            <p className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>History</p>
            <button
            onClick={onClear}
            className="text-[9px] transition-colors"
            style={{ color: "rgba(255,255,255,0.18)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.18)"; }}
            title="Clear all history"
            >
            clear all
            </button>
        </div>

        {sessions.map((s) => (
            <div
            key={s.id}
            className="group relative flex items-start gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all duration-100"
            style={{
                background: activeId === s.id ? "rgba(255,255,255,0.07)" : "transparent",
                borderLeft: activeId === s.id ? `2px solid ${TOOL_COLORS[s.tool]}` : "2px solid transparent",
            }}
            onClick={() => onSelect(s)}
            onMouseEnter={(e) => { if (activeId !== s.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { if (activeId !== s.id) e.currentTarget.style.background = "transparent"; }}
            >
            {/* Tool icon badge */}
            <span
                className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
                style={{ background: `${TOOL_COLORS[s.tool]}22`, color: TOOL_COLORS[s.tool] }}
            >
                {TOOL_ICONS[s.tool]}
            </span>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
                <p className="text-[11px] leading-tight truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{s.title}</p>
                <p className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.22)", fontFamily: "JetBrains Mono, monospace" }}>
                {s.tool} · {timeAgo(s.updatedAt)}
                </p>
            </div>

            {/* Delete button, shown on hover */}
            <button
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                style={{ color: "rgba(255,255,255,0.25)" }}
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; }}
            >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
            </div>
        ))}
        </div>
    );
}