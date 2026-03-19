import { motion } from 'framer-motion';
import MagneticButton from './MagneticButton';
import TextType from './TextType';
import LiquidEther from './LiquidEther';
import { useState } from 'react';

const transition = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

interface HeroSectionProps {
  onComplete?: () => void;
}

const HERO_COLORS = ['#efbf04', '#efbf04'];

export default function HeroSection({ onComplete }: HeroSectionProps) {
  const [introLine1Done, setIntroLine1Done] = useState(false);
  const [typeDone, setTypeDone] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const handleTypingDone = () => {
    if (typeDone) return;
    setTypeDone(true);
    setContentVisible(true);
    onComplete?.();
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 bg-black">
      {/* LiquidEther fluid animation background */}
      <div className="absolute inset-0 z-0">
        <LiquidEther
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          colors={HERO_COLORS}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          isBounce={false}
          resolution={0.3}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <motion.div style={{ willChange: 'transform' }} className="relative z-10 text-center px-4 md:px-6 max-w-[90vw] md:max-w-6xl mx-auto flex flex-col items-center justify-center h-full pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={contentVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ ...transition, delay: 0.1 }}
        >
          <span className="inline-block border border-primary/20 bg-zinc-950/70 rounded-full px-6 py-2 md:px-8 md:py-3 text-[10px] md:text-xs font-heading font-medium tracking-[0.2em] uppercase text-primary/90">
            Four IQ Tech — Next-Gen IT Solutions
          </span>
        </motion.div>

        <div className="font-display font-light leading-[0.9] tracking-tight mb-8 md:mb-10 flex flex-col items-center min-h-[160px] md:min-h-[280px] justify-center">
          {/* First line: We Build */}
          <div className="text-foreground/90 italic text-[clamp(2.5rem,7vw,7rem)]">
            <TextType
              texts={["We Build"]}
              typingSpeed={80}
              deletingSpeed={0}
              pauseDuration={100}
              showCursor={false}
              className="inline-block"
              onDone={() => setIntroLine1Done(true)}
            />
          </div>

          {/* Second line: Digital Future */}
          <div className="font-bold glow-text not-italic text-[clamp(3.5rem,9vw,9rem)] leading-[1.1] pb-4">
            {introLine1Done ? (
              <TextType
                texts={["Digital Future"]}
                typingSpeed={80}
                deletingSpeed={50}
                pauseDuration={1200}
                showCursor={!typeDone}
                cursorCharacter="_"
                cursorBlinkDuration={0.5}
                className="inline-block"
                onDone={handleTypingDone}
              />
            ) : (
              <span className="opacity-0">Digital Future</span>
            )}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ ...transition, delay: 0.4 }}
          className="text-lg md:text-2xl text-muted-foreground/80 max-w-xl md:max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed font-light tracking-wide px-4"
        >
          Transforming businesses with cutting-edge technology, innovative design, and scalable solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={contentVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ ...transition, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full sm:w-auto"
        >
          <MagneticButton
            href="#services"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-primary text-primary-foreground font-heading font-semibold rounded-full text-sm md:text-base tracking-widest uppercase glow-box transition-all duration-500 hover:bg-primary/90 flex items-center justify-center"
          >
            Explore Services
          </MagneticButton>
          <MagneticButton
            href="#about"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 border border-white/10 bg-zinc-950/60 text-foreground font-heading font-semibold rounded-full text-sm md:text-base tracking-widest uppercase transition-all duration-500 hover:bg-white/10 flex items-center justify-center"
          >
            Learn More
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={contentVisible ? { opacity: 1, height: 60 } : {}}
        transition={{ delay: 1.2, duration: 1.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-primary hidden md:block"
      />
    </section>
  );
}
