interface SliderParamProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (v: number) => void;
}

export function SliderParam({ label, value, min, max, step, unit = "", onChange }: SliderParamProps) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
            <span className="text-[11px] font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "JetBrains Mono, monospace" }}>
            {value}{unit}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
            accentColor: "#7c9ef8",
            background: `linear-gradient(to right, #7c9ef8 ${pct}%, rgba(255,255,255,0.1) 0%)`,
            }}
        />
        <div className="flex justify-between">
            <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>{min}</span>
            <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono, monospace" }}>{max}</span>
        </div>
        </div>
    );
}