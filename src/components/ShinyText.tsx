import { motion } from 'framer-motion';

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

export default function ShinyText({ text, disabled = false, speed = 5, className = "" }: ShinyTextProps) {
    const animationDuration = `${speed}s`;

    return (
        <div
            className={`relative inline-block text-transparent bg-clip-text ${className}`}
            style={{
                backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                animationName: disabled ? 'none' : 'shimmer',
                animationDuration: animationDuration,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
            }}
        >
            {text}
            <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
        </div>
    );
}
