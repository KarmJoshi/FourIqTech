import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CursorFollower() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!cursorRef.current || !followerRef.current) return;

        const cursor = cursorRef.current;
        const follower = followerRef.current;

        // Mouse position
        let mouseX = 0;
        let mouseY = 0;

        // Follower position
        let posX = 0;
        let posY = 0;

        // Velocity for jelly effect
        let velX = 0;
        let velY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Immediate update for the dot
            gsap.to(cursor, { x: mouseX - 4, y: mouseY - 4, duration: 0 });
        };

        const loop = () => {
            // Smooth following with easing
            const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());

            posX += (mouseX - posX) * dt;
            posY += (mouseY - posY) * dt;

            velX = mouseX - posX;
            velY = mouseY - posY;

            // Calculate stretch/squeeze based on velocity
            const squeeze = Math.max(Math.abs(velX), Math.abs(velY)) / 100;
            const rotate = Math.atan2(velY, velX) * 180 / Math.PI;

            const scaleX = 1 + squeeze;
            const scaleY = 1 - squeeze * 0.5; // Maintain area somewhat

            // Clamp scaling
            const clampedScaleX = Math.min(Math.max(scaleX, 0.5), 1.8);
            const clampedScaleY = Math.min(Math.max(scaleY, 0.5), 1.8);

            gsap.set(follower, {
                x: posX - 16,
                y: posY - 16,
                rotation: rotate,
                scaleX: clampedScaleX,
                scaleY: clampedScaleY
            });

            requestAnimationFrame(loop);
        };

        const raf = requestAnimationFrame(loop);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInteractive =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('cursor-pointer');

            if (isInteractive) {
                gsap.to(follower, {
                    width: 60,
                    height: 60,
                    x: posX - 30, // Re-center
                    y: posY - 30, // Re-center
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    mixBlendMode: 'normal',
                    duration: 0.3
                });
                gsap.to(cursor, { opacity: 0, duration: 0.3 });
            } else {
                gsap.to(follower, {
                    width: 32,
                    height: 32,
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    mixBlendMode: 'difference',
                    duration: 0.3
                });
                gsap.to(cursor, { opacity: 1, duration: 0.3 });
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseover', handleMouseOver, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <>
            {/* Small center dot - always follows exactly */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
            />
            {/* Fluid follower ring */}
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/50 pointer-events-none z-[9998] mix-blend-difference"
            />
        </>
    );
}
