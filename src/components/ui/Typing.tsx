export function Typing(){
    return(
        <div className="flex items-center gap-1 px-1 py-0.5">
            {[0, 1, 2].map((i) =>(
                <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{
                        background: "rgba(255,255,255,0.3)",
                        animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite,`
                    }}
                />
            ))}
        </div>
    );
}