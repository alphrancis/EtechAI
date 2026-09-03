export function Typing({ color = "rgba(255,255,255,0.6)" }: { color?: string }) {
    return (
        <div className="flex items-center gap-1.5 px-1 py-0.5">
        {[0, 1, 2].map((i) => (
            <span
            key={i}
            style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: color,
                display: "inline-block",
                animation: "cascade-bounce 1.1s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
            }}
            />
        ))}
        </div>
    );
}