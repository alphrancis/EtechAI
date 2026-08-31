export function LogoMark({ size = 28}: {size?: number}){
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="5" stroke="url(#lp)" strokeWidth="1.5" opacity="0.6"/>
            <circle cx="16" cy="16" r="5" fill="url(#lp2)"/>
            <circle cx="16" cy="4" r="2.2" fill="#7C9EF8"/>
            <circle cx="28" cy="28" r="2.2" fill="#6BCF8E"/>
            <circle cx="16" cy="28" r="2.2" fill="#F07A6B"/>
            <circle cx="4" cy="16" r="2.2" fill="#F0C84A"/>
            <defs>
                <linearGradient id="lp" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c9ef8" />
                <stop offset="0.5" stopColor="#6bcf8e" />
                <stop offset="1" stopColor="#f07a6b" />
                </linearGradient>
                <radialGradient id="lp2" cx="50%" cy="50%" r="50%">
                <stop stopColor="#b3ccfd" />
                <stop offset="1" stopColor="#7c9ef8" />
                </radialGradient>
            </defs>
        </svg>
    );
}