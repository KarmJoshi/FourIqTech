# FouriqTech Design System Reference

> This file is read by AI agents to ensure generated pages match the existing site aesthetic.

## Color Tokens (HSL — defined in index.css @layer base :root)

| Token | Value | Usage |
|---|---|---|
| `--background` | `220 25% 2%` | Ultra-dark near-black page BG |
| `--foreground` | `42 30% 90%` | Warm off-white body text |
| `--primary` | `42 85% 55%` | Gold — CTA buttons, highlights |
| `--primary-foreground` | `220 25% 3%` | Text on primary BG |
| `--accent` | `260 60% 60%` | Soft purple — secondary accents |
| `--muted` | `220 18% 8%` | Subtle BG for inputs, badges |
| `--muted-foreground` | `220 10% 50%` | Dimmed text |
| `--border` | `220 18% 10%` | Card/section borders |
| `--gold` | `42 85% 55%` | Alias for primary gold |
| `--gold-light` | `45 90% 70%` | Lighter gold for gradients |
| `--gold-dark` | `38 80% 40%` | Darker gold for gradients |

## Font Families

| Token | Stack | Usage |
|---|---|---|
| `font-display` | `"Playfair Display", "Space Grotesk", serif` | Headlines (h1-h6) |
| `font-heading` | `"Space Grotesk", system-ui, sans-serif` | Kickers, labels, buttons |
| `font-body` | `"Inter", system-ui, sans-serif` | Body text |

## CSS Utility Classes

| Class | Effect |
|---|---|
| `glass` | Frosted glass card (bg-glass + border + backdrop-blur-xl) |
| `glass-card` | Lighter glass with hover lift + gold border glow |
| `glass-modern` | Gradient glass with deeper hover shadow |
| `text-gradient` | Animated gold gradient text (bg-clip-text) |
| `text-gold` | Static gold text with soft glow |
| `glow-text` | Triple-layer gold text-shadow |
| `glow-box` | Gold box-shadow for CTAs |
| `liquid-bg` | Radial gradient decorative background |
| `liquid-blob` | Morphing border-radius animation |

## Component Patterns

### Section Layout Pattern
```tsx
<section className="relative py-32 px-6">
  {/* Background decoration */}
  <div className="absolute ... bg-primary/[0.04] rounded-full blur-[150px] liquid-blob" />
  
  <div className="max-w-7xl mx-auto relative">
    {/* Kicker */}
    <span className="text-primary text-sm font-heading font-medium uppercase tracking-[0.2em]">
      ✦ Section Label
    </span>
    {/* Title */}
    <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
      Title <span className="text-gradient">Highlight</span>
    </h2>
    {/* Subtitle */}
    <p className="text-muted-foreground text-lg max-w-xl">
      Description text here.
    </p>
  </div>
</section>
```

### Card Pattern (Service Cards)
```tsx
<div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] p-10 transition-[border-color,transform] duration-500 hover:border-primary/45">
  {/* Hover gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  {/* Blur accent */}
  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/15 blur-2xl opacity-40" />
  
  <div className="relative z-10">
    {/* Icon container */}
    <div className="inline-flex rounded-2xl border border-zinc-700/40 bg-zinc-800/55 p-5 text-zinc-100 group-hover:border-primary/35 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-500">
      <IconComponent size={38} strokeWidth={1.6} />
    </div>
    <h3 className="mt-8 font-display text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-500">
      Card Title
    </h3>
    <p className="mt-5 text-base leading-relaxed text-muted-foreground">
      Card description.
    </p>
  </div>
</div>
```

### CTA Button Pattern
```tsx
<motion.button
  whileHover={{ scale: 1.02, boxShadow: '0 0 50px hsl(42 85% 55% / 0.35)' }}
  whileTap={{ scale: 0.98 }}
  className="py-3.5 px-8 bg-primary text-primary-foreground font-heading font-semibold rounded-xl glow-box transition-all duration-500 flex items-center justify-center gap-2"
>
  Button Text <ArrowUpRight size={18} />
</motion.button>
```

### Page Template (Blog/Secondary Pages)
```tsx
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useScrollLock } from '@/components/SmoothScroll';
import SEO from '@/components/SEO';

export default function PageName() {
  const [navVisible, setNavVisible] = useState(false);
  const { setScrollLocked } = useScrollLock();

  useEffect(() => {
    setNavVisible(true);
    setScrollLocked(false);
  }, [setScrollLocked]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-32">
      <SEO title="..." description="..." url="https://fouriqtech.com/..." />
      <Navbar isVisible={navVisible} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Page content */}
      </main>
      <Footer />
    </div>
  );
}
```

## Animation Patterns

### GSAP ScrollTrigger (used in ServicesSection)
```tsx
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(element, 
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' }
      }
    );
  }, containerRef);
  return () => ctx.revert();
}, []);
```

### Framer Motion (used in ContactSection)
```tsx
import { motion, useInView } from 'framer-motion';

const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: '-100px' });

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
  animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
>
```

## Import Conventions

| Package | Usage |
|---|---|
| `lucide-react` | All icons (Code2, Cloud, Shield, ArrowUpRight, etc.) |
| `framer-motion` | motion components, useInView |
| `gsap` + `gsap/ScrollTrigger` | Complex scroll animations |
| `@/components/...` | Internal component imports |
| `react-router-dom` | Link, useParams |
