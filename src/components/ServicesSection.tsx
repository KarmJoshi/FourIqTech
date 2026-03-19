import { useRef, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Cloud, Shield, Smartphone, Database, Cpu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Code2,
    title: 'Web Development',
    description:
      'Custom web applications built with modern frameworks, optimized for performance and long-term scalability.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description:
      'Cross-platform mobile products delivering native-level performance with elegant, intuitive user experiences.',
  },
  {
    icon: Cloud,
    title: 'Cloud Solutions',
    description:
      'Scalable cloud architecture on AWS, Azure, and GCP with CI/CD automation and resilient infrastructure patterns.',
  },
  {
    icon: Shield,
    title: 'Cybersecurity',
    description:
      'Comprehensive security audits, penetration testing, and real-time threat monitoring to protect critical systems.',
  },
  {
    icon: Database,
    title: 'Data Engineering',
    description:
      'End-to-end data pipelines, analytics platforms, and reliable foundations for AI/ML data operations.',
  },
  {
    icon: Cpu,
    title: 'AI & Automation',
    description:
      'Intelligent automation solutions powered by modern machine learning models and domain-specific workflows.',
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const stripRef = useRef<HTMLDivElement>(null);

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    if (el) cardRefs.current[i] = el;
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const strip = stripRef.current;
      if (!section || !strip) return;

      const isMobile =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 1024;

      const introTargets = [kickerRef.current, titleRef.current, subtitleRef.current].filter(
        Boolean
      ) as HTMLElement[];

      if (isMobile) {
        if (introTargets.length > 0) gsap.set(introTargets, { opacity: 1, y: 0 });
        if (cardRefs.current.length > 0) {
          gsap.set(cardRefs.current, { opacity: 1, y: 0, scale: 1 });
          cardRefs.current.forEach((card) => {
            if (!card) return;
            const content = card.querySelectorAll<HTMLElement>('.service-anim');
            if (content.length > 0) gsap.set(content, { opacity: 1, y: 0 });
          });
        }
        return;
      }

      // Desktop: horizontal scroll pinning
      const totalScrollWidth = strip.scrollWidth - window.innerWidth;

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
      
      // Force refresh to ensure correct dimensions on first load
      ScrollTrigger.refresh();

      // Intro header fade-in
      if (introTargets.length > 0) {
        gsap.fromTo(
          introTargets,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Card reveal animations keyed to horizontal position
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const content = card.querySelectorAll<HTMLElement>('.service-anim');

        gsap.fromTo(
          card,
          { opacity: 0, y: 24, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tl,
              start: 'left 90%',
              toggleActions: 'play none none reverse',
              onEnter: () => card.classList.add('is-active'),
              onLeave: () => card.classList.remove('is-active'),
              onEnterBack: () => card.classList.add('is-active'),
              onLeaveBack: () => card.classList.remove('is-active'),
            },
          }
        );

        if (content.length > 0) {
          gsap.fromTo(
            content,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.04,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tl,
                start: 'left 85%',
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative bg-background overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 liquid-bg opacity-15" />
        <div className="absolute top-24 left-[12%] h-72 w-72 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-24 right-[10%] h-72 w-72 rounded-full bg-accent/10 blur-2xl" />
      </div>

      {/* Horizontal strip */}
      <div
        ref={stripRef}
        className="flex min-h-screen flex-col items-stretch gap-6 px-4 py-16 will-change-transform sm:px-6 sm:py-20 lg:h-screen lg:flex-row lg:items-center lg:gap-8 lg:px-12 lg:py-0"
        style={{ width: '100%' }}
      >
        {/* Intro header column */}
        <div className="flex h-auto w-full flex-shrink-0 flex-col items-start justify-center pr-0 lg:h-full lg:w-[480px] lg:pr-8">
          <span
            ref={kickerRef}
            className="inline-flex items-center gap-2 text-xs font-heading font-medium uppercase tracking-[0.22em] text-primary sm:gap-3 sm:text-sm sm:tracking-[0.3em]"
          >
            <span className="h-[2px] w-8 bg-gradient-to-r from-transparent via-primary to-transparent sm:w-12" />
            What We Do
            <span className="h-[2px] w-8 bg-gradient-to-r from-transparent via-primary to-transparent sm:w-12" />
          </span>

          <h2
            ref={titleRef}
            className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:mt-6 lg:text-7xl xl:text-8xl"
          >
            Our
            <br />
            <span className="text-gradient">Services</span>
          </h2>

          <p ref={subtitleRef} className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg">
            End-to-end digital solutions tailored to your unique business needs.
          </p>

          <div className="mt-8 hidden text-[11px] font-heading uppercase tracking-[0.28em] text-white/40 lg:block">
            ← Scroll down to explore →
          </div>
        </div>

        {/* Cards */}
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={service.title}
              ref={(el) => setCardRef(el, index)}
              // Removed backdrop-blur-md; changed bg-zinc-900/30 to bg-[#0d0d0d] for better render perf
              className="service-card group relative min-h-[320px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 transition-[border-color,transform] duration-500 hover:border-primary/45 sm:min-h-[360px] sm:p-8 lg:h-[500px] lg:w-[380px] lg:flex-shrink-0 lg:p-10 xl:w-[420px]"
              style={{ willChange: 'transform' }}
            >
              <div className="service-anim absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {/* Reduced blur radius from blur-3xl to blur-2xl to save GPU cycles */}
              <div className="service-anim absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl opacity-40 sm:-right-16 sm:-top-16 sm:h-40 sm:w-40" />

              <div className="relative z-10 flex h-full flex-col">
                <span className="service-anim text-[11px] font-heading uppercase tracking-[0.32em] text-white/45">
                  {(index + 1).toString().padStart(2, '0')}
                </span>

                <div className="service-anim mt-5 inline-flex w-fit rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-4 text-zinc-100 shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary sm:mt-7 sm:p-5">
                  <Icon size={32} strokeWidth={1.6} className="sm:h-[38px] sm:w-[38px]" />
                </div>

                <h3 className="service-anim mt-6 font-display text-2xl font-bold text-foreground transition-colors duration-500 group-hover:text-primary sm:mt-8 sm:text-3xl">
                  {service.title}
                </h3>

                <p className="service-anim mb-auto mt-4 text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
                  {service.description}
                </p>

                <div className="service-anim mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-all duration-500 group-hover:text-primary sm:mt-8">
                  <span>Explore Service</span>
                  <svg
                    className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}

        {/* Trailing spacer */}
        <div className="hidden w-20 flex-shrink-0 lg:block" />
      </div>

      <style>{`
        .service-card {
          /* Simplified shadow for performance */
          box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.8);
        }
        .service-card.is-active {
          border-color: hsl(42 85% 55% / 0.55);
          box-shadow: 0 0 0 1px hsl(42 85% 55% / 0.18), 0 20px 50px -20px hsl(42 85% 55% / 0.3);
        }
      `}</style>
    </section>
  );
}
