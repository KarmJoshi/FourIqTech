import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
}

export default function MagneticButton({ children, className = '', onClick, href }: MagneticButtonProps) {
    const ref = useRef<HTMLElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouse = (e: React.MouseEvent<HTMLElement>) => {
        const { clientX, clientY } = e;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        
        const middleX = clientX - (rect.left + rect.width / 2);
        const middleY = clientY - (rect.top + rect.height / 2);

        x.set(middleX * 0.15);
        y.set(middleY * 0.15);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    const Component = href ? motion.a : motion.button;

    return (
        <Component
            ref={ref as any}
            href={href}
            onClick={onClick}
            className={className}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            style={{ x: springX, y: springY }}
        >
            {children}
        </Component>
    );
}
