
import { useRef } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame
} from "framer-motion";
import { wrap } from "@motionone/utils";

interface ParallaxProps {
    children: string;
    baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 2], {
        clamp: false
    });

    /**
     * This is a magic wrapping for the length of the text - you
     * have to replace for wrapping that works for you or dynamically
     * calculate
     */
    const x = useTransform(baseX, (v) => `${wrap(-12.5, 0, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        /**
         * This is what changes the direction of the scroll once we
         * switch scrolling directions.
         */
        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    /**
     * The number of times to repeat the child text should be dynamic based on the size of the text and viewport.
     * For simplicity, we repeat it 8 times here.
     */
    return (
        <div className="overflow-hidden whitespace-nowrap flex flex-nowrap -my-2 md:-my-4 py-2">
            <motion.div
                className="flex flex-nowrap"
                style={{ x, willChange: "transform" }}
            >
                {[...Array(8)].map((_, i) => (
                    <span key={i} className="block pr-20">
                        {children}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

interface ScrollVelocityProps {
    texts: string[];
    velocity?: number;
    className?: string;
}

export default function ScrollVelocity({ texts, velocity = 5, className = "" }: ScrollVelocityProps) {
    return (
        <section className={`w-full overflow-hidden whitespace-nowrap ${className}`}>
            {texts.map((text, index) => (
                <ParallaxText key={index} baseVelocity={velocity * (index % 2 === 0 ? 1 : -1)}>
                    {text}
                </ParallaxText>
            ))}
        </section>
    );
}
