interface DotProps {
    active: boolean;
    color?: string;
}

export function Dot({ active, color }: DotProps){
    return(
        <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
                background: active ? (color ?? `#4ADE80`) : "rgba(255,255,255,0.15)",
                boxShadow: active ? `0 0 6px ${color ?? "#4ADE80"}88` : "none",
            }}
        />
    );
}