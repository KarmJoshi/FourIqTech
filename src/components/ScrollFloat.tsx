import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
    children: string;
    animationDuration?: number;
    ease?: string;
    scrollStart?: string;
    scrollEnd?: string;
    stagger?: number;
}

export default function ScrollFloat({
    children,
    animationDuration = 1,
    ease = 'back.inOut(2)',
    scrollStart = 'center bottom+=50%',
    scrollEnd = 'bottom bottom-=40%',
    stagger = 0.03,
}: ScrollFloatProps) {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const chars = containerRef.current.querySelectorAll('.char');

        gsap.fromTo(
            chars,
            {
                y: 100,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                duration: animationDuration,
                ease: ease,
                stagger: stagger,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: scrollStart,
                    end: scrollEnd,
                    toggleActions: 'play none none reverse',
                },
            }
        );
    }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

    const chars = children.split('').map((char, index) => (
        <span key={index} className="char inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
            {char}
        </span>
    ));

    return <span ref={containerRef} className="inline-block">{chars}</span>;
}
