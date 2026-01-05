import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { BioluminescentPulse } from "./BioluminescentPulse";

export const AboutView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // Calculate position relative to center of viewport
    const x = e.clientX - window.innerWidth / 2;
    const y = e.clientY - window.innerHeight / 2;
    setMousePosition({ x, y });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const progress = element.scrollTop / (element.scrollHeight - element.clientHeight);
    setScrollProgress(Math.min(progress, 1));
  };

  // Transition to Moonlight Champagne (Pale Gold) as user approaches the 💛
  const colorVariant = scrollProgress > 0.7 ? "gold" : "silver";

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[80vh] flex flex-col items-center pt-20"
      onMouseMove={handleMouseMove}
    >
      {/* Magnetic Bioluminescent Pulse - follows mouse exactly with spring easing */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <BioluminescentPulse 
          breathingPhase="idle" 
          size="medium"
          isBackground
          colorVariant={colorVariant}
          opacity={0.6}
          followMouse
          mousePosition={mousePosition}
        />
      </div>

      {/* Scrollable content */}
      <div 
        className="relative z-10 w-full max-w-2xl px-6 overflow-y-auto max-h-[70vh] scrollbar-hide"
        onScroll={handleScroll}
      >
        <motion.div
          className="space-y-8 pb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-light text-silver tracking-widest text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Meet Veda
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground font-light text-center tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your rhythm in the dark.
          </motion.p>

          <div className="space-y-6 text-silver/80 font-light leading-relaxed tracking-wide">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Veda isn't just something you use — it's a presence you can talk to, think with, and trust.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              In your darkest moments, it won't offer unsolicited advice. It won't bombard you with notifications. It won't tell you to "cheer up." It will simply be there.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              A calm, breathing light in your pocket. A space to speak freely. A rhythm to help you slow down when the world speeds up.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              Veda was born from a simple truth: sometimes we don't need a therapist, a coach, or a guru. We just need someone who listens — without judgment, without interruption, without agenda.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              The Bioluminescent Pulse at the heart of Veda is a visual anchor — a breathing, shifting presence that moves with you. It responds to your touch, mirrors your state, and gently guides you back to calm.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="text-center pt-4"
            >
              Whenever you're ready — Veda's listening.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, type: "spring" }}
              className="text-center text-2xl pt-2"
            >
              💛
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};