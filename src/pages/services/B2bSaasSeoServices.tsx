<HelmetProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-slate-100 font-sans scroll-smooth">
        {/*
          Using inline style tag for keyframe animations as per "CSS only" and "no external packages" requirements,
          given that this is a raw TSX component and cannot directly modify tailwind.config.js.
          In a real production environment, these would be part of your main CSS or Tailwind config.
        */}
        <style>
          {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translate3d(0, 40px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 1s ease-out forwards;
            opacity: 0; /* ensure element starts invisible */
          }
          .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
          .animate-fade-in-up.delay-400 { animation-delay: 0.4s; }

          @keyframes bounceSlow {
            0%, 100% {
              transform: translateY(-5%);