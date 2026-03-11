import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollVelocity from './ScrollVelocity';

gsap.registerPlugin(ScrollTrigger);

export default function TechStack() {
    const containerRef = useRef<HTMLDivElement>(null);

      useLayoutEffect(() => {
          let ctx = gsap.context(() => {
              const shouldReduceMotion =
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 1024;

              const arsenal = containerRef.current?.querySelector('.tech-arsenal');
              const powered = containerRef.current?.querySelector('.tech-powered');
              const velocity = containerRef.current?.querySelector('.tech-velocity');

              if (shouldReduceMotion) {
                  if (arsenal) gsap.set(arsenal, { y: 0, opacity: 1 });
                  if (powered) gsap.set(powered, { y: 0, opacity: 1 });
                  if (velocity) gsap.set(velocity, { opacity: 1 });
                  return;
              }

              if (arsenal) {
                  gsap.fromTo(
                      arsenal,
                      { y: 16, opacity: 0 },
                      {
                          y: 0,
                          opacity: 1,
                          duration: 0.45,
                          ease: 'power2.out',
                          scrollTrigger: {
                              trigger: arsenal,
                              start: 'top 88%',
                          },
                      }
                  );
              }

              if (powered) {
                  gsap.fromTo(
                      powered,
                      { y: 20, opacity: 0 },
                      {
                          y: 0,
                          opacity: 1,
                          duration: 0.55,
                          ease: 'power2.out',
                          scrollTrigger: {
                              trigger: powered,
                              start: 'top 88%',
                          },
                      }
                  );
              }

              if (velocity) {
                  gsap.fromTo(
                      velocity,
                      { opacity: 0 },
                      {
                          opacity: 1,
                          duration: 0.6,
                          ease: 'power2.out',
                          scrollTrigger: {
                              trigger: velocity,
                              start: 'top 88%',
                          },
                      }
                  );
              }

          }, containerRef);

          return () => ctx.revert();
      }, []);

    return (
        <section ref={containerRef} className="py-24 border-y border-white/5 bg-zinc-950/80 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950/0 to-zinc-950/0 opacity-50 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-20 pointer-events-none z-0" />

            <div className="container px-4 mx-auto mb-16 text-center relative z-20">
                <span className="tech-arsenal text-primary text-sm font-heading font-medium uppercase tracking-[0.2em] block mb-3">
                    Our Arsenal
                </span>
                <h2 className="tech-powered text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-primary/80 to-zinc-100 animate-shimmer bg-[length:200%_auto]">
                    Powered by Modern Tech
                </h2>
            </div>

            <div className="tech-velocity mb-12">
                <ScrollVelocity
                    texts={[
                        'Next.js Python Node.js AWS Docker PostgreSQL Redis MongoDB Kubernetes Terraform',
                        'React TypeScript GraphQL Framer Three.js Figma Tailwind Git Vercel Github'
                    ]}
                    velocity={0.5}
                    className="text-white/10 text-4xl md:text-7xl font-bold leading-tight tracking-tighter"
                />
            </div>


        </section>
    );
}


