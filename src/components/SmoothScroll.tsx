import { useEffect, useState, createContext, useContext, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollContextType {
    setScrollLocked: (locked: boolean) => void;
}

const ScrollContext = createContext<ScrollContextType>({
    setScrollLocked: () => { },
});

export const useScrollLock = () => useContext(ScrollContext);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const [lenisRef, setLenisRef] = useState<Lenis | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        const shouldReduceMotion =
            window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 1024;

        if (shouldReduceMotion) {
            return;
        }

        const lenis = new Lenis({
            lerp: 0.1,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 2,
            syncTouch: false,
        });

        setLenisRef(lenis);

        // OFFICIAL LENIS + GSAP SCROLLTRIGGER SYNC
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000); // Convert GSAP's time (seconds) to Lenis's time (ms)
        });

        // Disable GSAP lag smoothing to prevent race conditions with Lenis rAF
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove(lenis.raf);
        };
    }, []);

    useEffect(() => {
        if (!lenisRef) return;
        if (isLocked) {
            lenisRef.stop();
        } else {
            lenisRef.start();
        }
    }, [isLocked, lenisRef]);

    return (
        <ScrollContext.Provider value={{ setScrollLocked: setIsLocked }}>
            {children}
        </ScrollContext.Provider>
    );
}
