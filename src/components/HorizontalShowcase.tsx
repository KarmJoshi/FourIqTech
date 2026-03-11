import { useRef, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const projects = [
    {
        title: "UrbanCabz",
        category: "Web Platform",
        image: "/images/urbancabz.png",
        description: "A comprehensive B2B & B2C taxi booking platform featuring real-time ride tracking, driver management, and dynamic pricing algorithms for efficient urban mobility.",
        link: "https://urbancabz.com/"
    },
    {
        title: "AI Data Automator",
        category: "Automation Tool",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
        description: "An intelligent document processing solution leveraging Gemini 1.5 Flash to automatically extract unstructured data from PDFs and convert it into organized Excel spreadsheets."
    }
];

export default function HorizontalShowcase() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const stripRef = useRef<HTMLDivElement>(null);

    const [reducedMotion] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 1024;
    });

    useLayoutEffect(() => {
        if (reducedMotion) return;

        const ctx = gsap.context(() => {
            const section = sectionRef.current;
            const strip = stripRef.current;
            if (!section || !strip) return;

            const totalScrollWidth = strip.scrollWidth - window.innerWidth + 96;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: `+=${totalScrollWidth}`,
                    pin: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            tl.to(strip, { 
                x: -totalScrollWidth, 
                ease: 'none' 
            });

            ScrollTrigger.refresh();
        }, sectionRef);

        return () => ctx.revert();
    }, [reducedMotion]);

    return (
        <section ref={sectionRef} id="showcase" className={`relative ${reducedMotion ? 'h-auto py-20' : 'h-screen'} bg-background overflow-hidden`}>
            <div className={`flex h-full items-center`}>
                <div 
                    ref={stripRef} 
                    className={`flex gap-8 will-change-transform ${reducedMotion ? 'flex-col px-6 md:px-12 w-full' : 'px-12 w-max'}`}
                >
                    <div className={`flex flex-col justify-center ${reducedMotion ? 'min-w-full h-auto' : 'w-[400px] h-full shrink-0 pr-8'}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-4"
                        >
                            <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="inline-block">✦</span>
                                Showcase
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="font-display text-5xl md:text-6xl font-bold mb-6"
                        >
                            Featured <br /><span className="text-gradient">Projects</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-muted-foreground text-lg max-w-sm"
                        >
                            A glimpse into the transformative digital experiences we've crafted for our global clients.
                        </motion.p>
                    </div>

                    {projects.map((project, index) => (
                        <div
                            key={index}
                            className={`group relative h-[450px] ${reducedMotion ? 'w-full md:w-[450px]' : 'w-[350px] md:w-[450px] shrink-0'} overflow-hidden rounded-3xl glass-card`}
                        >
                            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="h-full w-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent z-10" />

                            <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                                <div className="text-primary text-xs font-medium tracking-[0.1em] mb-2 uppercase">{project.category}</div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">{project.title}</h3>
                                <p className="text-sm text-neutral-300 mb-4">
                                    {project.description}
                                </p>
                                {project.link && (
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest gap-2"
                                    >
                                        Visit Website
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M7 17l9.2-9.2M17 17V7H7" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Trailing spacer */}
                    {!reducedMotion && <div className="hidden w-20 flex-shrink-0 lg:block" />}
                </div>
            </div>
        </section>
    );
}
