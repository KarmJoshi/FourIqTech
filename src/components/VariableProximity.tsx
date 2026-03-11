import { useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface VariableProximityProps {
    text: string;
    className?: string;
}

export default function VariableProximity({ text, className = "" }: VariableProximityProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(-1000);
    const mouseY = useMotionValue(-1000);
    const words = useMemo(() => text.split(' '), [text]);

    // ONE single listener for the entire component
    useEffect(() => {
        let frameId: number;
        const handleMouseMove = (e: MouseEvent) => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                mouseX.set(e.clientX);
                mouseY.set(e.clientY);
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div ref={containerRef} className={`flex flex-wrap items-center justify-center gap-x-[0.3em] ${className}`}>
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-flex">
                    {word.split('').map((char, charIndex) => (
                        <Character key={charIndex} char={char} mouseX={mouseX} mouseY={mouseY} />
                    ))}
                </span>
            ))}
        </div>
    );
}

function Character({ char, mouseX, mouseY }: { char: string; mouseX: any; mouseY: any }) {
    const charRef = useRef<HTMLSpanElement>(null);

    const springConfig = { stiffness: 150, damping: 15 };
    const scale = useSpring(1, springConfig);
    const colorOpacity = useSpring(0.6, springConfig);
    const y = useSpring(0, springConfig);

    // Subscribe to shared mouse values — NO new listener created
    useEffect(() => {
        const unsubX = mouseX.on('change', () => {
            if (!charRef.current) return;
            const rect = charRef.current.getBoundingClientRect();
            const charCX = rect.left + rect.width / 2;
            const charCY = rect.top + rect.height / 2;

            const distance = Math.sqrt(
                Math.pow(mouseX.get() - charCX, 2) + Math.pow(mouseY.get() - charCY, 2)
            );

            const maxDistance = 100;
            if (distance < maxDistance) {
                const proximity = 1 - distance / maxDistance;
                scale.set(1 + proximity * 0.2);
                colorOpacity.set(0.6 + proximity * 0.4);
                y.set(-proximity * 5);
            } else {
                scale.set(1);
                colorOpacity.set(0.6);
                y.set(0);
            }
        });

        return () => { unsubX(); };
    }, [mouseX, mouseY, scale, colorOpacity, y]);

    return (
        <motion.span
            ref={charRef}
            style={{
                scale,
                y,
                opacity: colorOpacity,
                display: 'inline-block',
            }}
        >
            {char}
        </motion.span>
    );
}
