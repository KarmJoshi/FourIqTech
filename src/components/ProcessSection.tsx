import { useRef, useLayoutEffect, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Lightbulb, Code2, Rocket, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: Search,
    title: 'Discovery',
    number: '01',
    tag: 'Research & Analysis',
    description:
      'Deep dive into your business goals, target audience, and market landscape. Stakeholder interviews and competitive analysis uncover the insights that drive every strategic decision.',
    metric: '2–4 wks',
    metricLabel: 'Sprint',
    accent: '42 85% 55%',
    side: 'right',
  },
  {
    icon: Lightbulb,
    title: 'Strategy',
    number: '02',
    tag: 'Architecture & Planning',
    description:
      'We architect a comprehensive roadmap — tech stack, design language, and scalability blueprint — ensuring every decision maps directly to your business objectives.',
    metric: '100%',
    metricLabel: 'Alignment',
    accent: '260 60% 65%',
    side: 'left',
  },
  {
    icon: Code2,
    title: 'Build',
    number: '03',
    tag: 'Agile Engineering',
    description:
      'Engineers craft scalable, clean code in 2-week agile cycles. Full transparency, rigorous code reviews, and best-in-class documentation at every stage.',
    metric: '2-week',
    metricLabel: 'Cycles',
    accent: '200 80% 60%',
    side: 'right',
  },
  {
    icon: Rocket,
    title: 'Launch',
    number: '04',
    tag: 'Deployment & QA',
    description:
      'Flawless deployment with zero-downtime migration, performance optimization, and security hardening. Every release is battle-tested before it touches production.',
    metric: '99.9%',
    metricLabel: 'Uptime SLA',
    accent: '20 90% 62%',
    side: 'left',
  },
  {
    icon: BarChart3,
    title: 'Scale',
    number: '05',
    tag: 'Grow & Optimize',
    description:
      'Post-launch analytics, continuous iteration, and proactive monitoring ensure your product evolves with your users and compounds growth over time.',
    metric: '∞',
    metricLabel: 'Support',
    accent: '145 60% 52%',
    side: 'right',
  },
];

export default function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);

  const particleData = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        width: 2 + (i % 3),
        height: 2 + (i % 3),
        /* Pre-calculate translations to use hardware-accelerated transforms instead of left/top layout reflows */
        x: `${8 + i * 9}vw`,
        y: `${10 + ((i * 13) % 70)}vh`,
        background: ['hsl(42 85% 55%/0.4)', 'hsl(260 60% 65%/0.32)', 'hsl(200 80% 60%/0.28)'][i % 3],
      })),
    []
  );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const shouldReduceMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 1024;

      const headerItems = gsap.utils.toArray<HTMLElement>('.proc-header > *');
      const rows = gsap.utils.toArray<HTMLElement>('.proc-row');

      if (shouldReduceMotion) {
        if (headerItems.length > 0) gsap.set(headerItems, { y: 0, opacity: 1 });
        rows.forEach((row) => {
          const node = row.querySelector('.proc-node');
          const number = row.querySelector('.proc-step-num');
          const content = row.querySelector('.proc-content');
          const connector = row.querySelector('.proc-connector');
          const innerItems = row.querySelectorAll('.proc-inner > *');

          if (node) gsap.set(node, { scale: 1, opacity: 1 });
          if (number) gsap.set(number, { opacity: 1, y: 0, scale: 1 });
          if (content) gsap.set(content, { x: 0, opacity: 1 });
          if (connector) gsap.set(connector, { scaleX: 1, opacity: 0.5 });
          if (innerItems.length > 0) gsap.set(innerItems, { y: 0, opacity: 1 });
        });
        if (spineRef.current) gsap.set(spineRef.current, { scaleY: 1, transformOrigin: 'top center' });
        return;
      }

      if (headerItems.length > 0) {
        gsap.fromTo(
          headerItems,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.proc-header', start: 'top 84%' },
          }
        );
      }

      if (spineRef.current) {
        gsap.fromTo(
          spineRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.proc-timeline',
              start: 'top 62%',
              end: 'bottom 42%',
              scrub: 0.6,
            },
          }
        );
      }

      rows.forEach((row, i) => {
        const isRight = i % 2 === 0;
        const node = row.querySelector('.proc-node');
        const number = row.querySelector('.proc-step-num');
        const content = row.querySelector('.proc-content');
        const connector = row.querySelector('.proc-connector');
        const innerItems = row.querySelectorAll('.proc-inner > *');

        if (node) {
          gsap.fromTo(
            node,
            { scale: 0.6, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.45,
              ease: 'power2.out',
              scrollTrigger: { trigger: row, start: 'top 86%' },
            }
          );
        }

        if (number) {
          gsap.fromTo(
            number,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              scrollTrigger: { trigger: row, start: 'top 86%' },
            }
          );
        }

        if (content) {
          gsap.fromTo(
            content,
            { x: isRight ? 30 : -30, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.55,
              ease: 'power2.out',
              scrollTrigger: { trigger: row, start: 'top 86%' },
            }
          );
        }

        if (innerItems.length > 0) {
          gsap.fromTo(
            innerItems,
            { y: 12, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: { trigger: row, start: 'top 86%' },
            }
          );
        }

        if (connector) {
          gsap.fromTo(
            connector,
            { scaleX: 0, opacity: 0.4 },
            {
              scaleX: 1,
              duration: 0.35,
              ease: 'power2.out',
              scrollTrigger: { trigger: row, start: 'top 86%' },
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
      id="process"
      className="relative bg-background overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* Particles */}
      {particleData.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            transform: `translate3d(${particle.x}, ${particle.y}, 0)`,
            background: particle.background,
            opacity: 0.2,
            willChange: 'transform'
          }}
        />
      ))}


      {/* ── HEADER ── */}
      <div className="proc-header pt-28 pb-20 text-center relative z-10">
        <span className="inline-block text-primary text-xs font-heading font-semibold uppercase tracking-[0.35em] mb-5 px-4 py-1.5 border border-primary/20 rounded-full bg-primary/5">
          How We Work
        </span>
        <h2 className="font-display text-5xl md:text-7xl font-bold mb-5 leading-tight">
          Our <span className="text-gradient">Process</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          A proven methodology designed to deliver exceptional results —{' '}
          <span className="text-foreground/50">from concept to scale.</span>
        </p>
      </div>

      {/* ── TIMELINE ── */}
      <div className="proc-timeline relative max-w-5xl mx-auto px-6 pb-32 z-10">

        {/* Center spine — positioned to sit behind the flex rows */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-36 w-[4px] bg-white/10 hidden md:block pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.1)] z-0" />
        <div
          ref={spineRef}
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-36 w-[4px] hidden md:block pointer-events-none shadow-[0_0_20px_rgba(234,179,8,0.5)] z-0"
          style={{ background: 'linear-gradient(180deg, hsl(42 85% 55%), hsl(260 60% 65%), hsl(200 80% 60%), hsl(20 90% 62%), hsl(145 60% 52%))' }}
        />

        {steps.map((step, i) => {
          const Icon = step.icon;
          const isRight = step.side === 'right';

          return (
            <div
              key={i}
              className="proc-row relative flex items-center gap-0 mb-20 md:mb-28 last:mb-0 z-10"
            >
              {/* ── LEFT SLOT ── */}
              <div className="hidden md:flex flex-1 justify-end pr-14 min-h-[120px] items-center">
                {!isRight && <ContentBlock step={step} Icon={Icon} />}
              </div>

              {/* ── CENTER NODE ── */}
              <div className="relative flex flex-col items-center z-10 shrink-0">
                {/* Connector LEFT */}
                {!isRight && (
                  <div
                    className="proc-connector absolute right-full top-[27px] h-px w-14 hidden md:block"
                    style={{
                      background: `linear-gradient(to left, hsl(${step.accent} / 0.9), transparent)`,
                      transformOrigin: 'right center',
                    }}
                  />
                )}
                {/* Connector RIGHT */}
                {isRight && (
                  <div
                    className="proc-connector absolute left-full top-[27px] h-px w-14 hidden md:block"
                    style={{
                      background: `linear-gradient(to right, hsl(${step.accent} / 0.9), transparent)`,
                      transformOrigin: 'left center',
                    }}
                  />
                )}

                {/* Node ring */}
                <div
                  className="proc-node relative w-14 h-14 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: `radial-gradient(circle at center, hsl(${step.accent} / 0.25), transparent 70%), #020617`,
                    border: `1px solid hsl(${step.accent} / 0.5)`,
                    boxShadow: `0 0 0 8px hsl(${step.accent} / 0.08), 0 0 40px -8px hsl(${step.accent} / 0.7)`,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: `1px solid hsl(${step.accent} / 0.3)`,
                      animation: `node-pulse-${i} 2.5s ease-in-out infinite`,
                    }}
                  />
                  <Icon size={20} style={{ color: `hsl(${step.accent})` }} />
                </div>

                {/* Step number below node */}
                <span
                  className="proc-step-num mt-2 text-[10px] font-mono font-bold tracking-widest"
                  style={{ color: `hsl(${step.accent} / 0.8)` }}
                >
                  {step.number}
                </span>
              </div>

              {/* ── RIGHT SLOT ── */}
              <div className="hidden md:flex flex-1 justify-start pl-14 min-h-[120px] items-center">
                {isRight && <ContentBlock step={step} Icon={Icon} />}
              </div>

              {/* ── MOBILE (full width below node) ── */}
              <div className="md:hidden flex-1 ml-5 proc-content">
                <ContentBlock step={step} Icon={Icon} />
              </div>
            </div>
          );
        })}

        {/* ── END NODE ── */}
        <div className="hidden md:flex flex-col items-center relative z-10">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border border-primary/30"
            style={{
              background: 'radial-gradient(circle, hsl(42 85% 55% / 0.18), transparent)',
              boxShadow: '0 0 50px -8px hsl(42 85% 55% / 0.5)',
              animation: 'end-pulse 3s ease-in-out infinite',
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-primary" style={{ boxShadow: '0 0 10px hsl(42 85% 55%)' }} />
          </div>
          <a
            href="#contact"
            className="mt-6 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-heading font-semibold text-background bg-primary hover:opacity-90 transition-opacity duration-300"
            style={{ boxShadow: '0 0 40px -6px hsl(42 85% 55% / 0.6)' }}
          >
            Let's build together
            <Rocket size={14} />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes end-pulse {
          0%,100% { box-shadow: 0 0 40px -8px hsl(42 85% 55% / 0.4); }
          50%      { box-shadow: 0 0 70px -6px hsl(42 85% 55% / 0.75); }
        }
        ${steps.map((_, i) => `
          @keyframes node-pulse-${i} {
            0%,100% { transform: scale(1);   opacity: 0.6; }
            50%      { transform: scale(1.55); opacity: 0; }
          }
        `).join('')}
      `}</style>
    </section>
  );
}

/* ── Reusable content block ── */
function ContentBlock({ step, Icon: _Icon }: { step: typeof steps[0]; Icon: React.ElementType }) {
  return (
    <div className="proc-content max-w-[380px] w-full">
      <div className="proc-inner flex flex-col gap-3">

        {/* Tag */}
        <span
          className="text-[10px] font-heading font-bold uppercase tracking-[0.28em]"
          style={{ color: `hsl(${step.accent} / 0.8)` }}
        >
          {step.tag}
        </span>

        {/* Title */}
        <h3
          className="font-display text-4xl md:text-5xl font-bold leading-none"
          style={{
            background: `linear-gradient(135deg, #ffffff 30%, hsl(${step.accent}))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {step.title}
        </h3>

        {/* Thin accent line */}
        <div
          className="w-10 h-[2px] rounded-full"
          style={{ background: `linear-gradient(90deg, hsl(${step.accent}), transparent)` }}
        />

        {/* Description */}
        <p className="text-zinc-400 text-sm leading-[1.75]">
          {step.description}
        </p>

        {/* Stat */}
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className="text-2xl font-black font-mono leading-none"
            style={{ color: `hsl(${step.accent})`, textShadow: `0 0 20px hsl(${step.accent} / 0.7)` }}
          >
            {step.metric}
          </span>
          <span className="text-xs text-zinc-500 uppercase tracking-widest">
            {step.metricLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
