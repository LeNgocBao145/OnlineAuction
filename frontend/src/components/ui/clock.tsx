import { useState, useEffect } from 'react';

export default function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-2xl">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-white/80 font-mono text-sm tracking-widest">
                {time.toLocaleTimeString('vi-VN', { hour12: false })}
            </span>
        </div>
    );
}
