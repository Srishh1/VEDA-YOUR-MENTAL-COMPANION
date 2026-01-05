import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface BioluminescentPulseProps {
  breathingPhase?: "idle" | "inhale" | "hold" | "exhale";
  size?: "small" | "medium" | "large";
  isBackground?: boolean;
  colorVariant?: "silver" | "gold";
  opacity?: number;
  followMouse?: boolean;
  mousePosition?: { x: number; y: number };
}

export const BioluminescentPulse = ({ 
  breathingPhase = "idle", 
  size = "large",
  isBackground = false,
  colorVariant = "silver",
  opacity = 1,
  followMouse = false,
  mousePosition,
}: BioluminescentPulseProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Long spring transition for fluid "magnetic" distortion toward cursor
  const springConfig = { damping: 25, stiffness: 60, mass: 1.2 };
  const pulseX = useSpring(useTransform(mouseX, [-300, 300], [-50, 50]), springConfig);
  const pulseY = useSpring(useTransform(mouseY, [-300, 300], [-50, 50]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBackground) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  // Breathing scale values: expand/contract like a lung
  const getBreathingScale = () => {
    switch (breathingPhase) {
      case "inhale":
        return 1.35; // Scale up significantly
      case "hold":
        return 1.3;  // Slight settle
      case "exhale":
        return 0.85; // Contract smaller than idle
      default:
        return 1;
    }
  };

  const getBreathingDuration = () => {
    switch (breathingPhase) {
      case "inhale":
        return 4;
      case "hold":
        return 7;
      case "exhale":
        return 8;
      default:
        return 3;
    }
  };

  const getBreathingOpacity = () => {
    switch (breathingPhase) {
      case "inhale":
        return 1;    // High glow
      case "hold":
        return 0.85; // Gentle
      case "exhale":
        return 0.4;  // Dim glow
      default:
        return 0.7;
    }
  };

  // Size configuration
  const sizeConfig = {
    small: { width: 150, height: 150 },
    medium: { width: 280, height: 280 },
    large: { width: 400, height: 400 },
  };

  const { width, height } = sizeConfig[size];

  // Color configurations: Midnight Indigo/Silver and Pale Gold
  const colors = {
    silver: {
      outer: "hsla(230, 25%, 25%, 0.3)",      // Midnight Indigo
      mid: "hsla(213, 30%, 55%, 0.25)",       // Silver-blue
      inner: "hsla(213, 35%, 70%, 0.15)",     // Light silver
      glow: "hsla(213, 40%, 65%, 0.4)",       // Silver glow
    },
    gold: {
      outer: "hsla(40, 35%, 30%, 0.3)",       // Warm gold shadow
      mid: "hsla(45, 50%, 60%, 0.25)",        // Moonlight champagne
      inner: "hsla(50, 55%, 75%, 0.15)",      // Pale gold
      glow: "hsla(45, 60%, 70%, 0.4)",        // Gold glow
    },
  };

  const c = colors[colorVariant];

  // Layered box-shadows for bioluminescent effect - soft halo with no hard edges
  const getBoxShadow = () => {
    const glowIntensity = breathingPhase === "inhale" ? 1.3 : 
                          breathingPhase === "exhale" ? 0.5 : 1;
    
    return `
      0 0 ${60 * glowIntensity}px ${40 * glowIntensity}px ${c.outer},
      0 0 ${100 * glowIntensity}px ${60 * glowIntensity}px ${c.mid},
      0 0 ${150 * glowIntensity}px ${80 * glowIntensity}px ${c.inner},
      0 0 ${200 * glowIntensity}px ${100 * glowIntensity}px ${c.glow},
      inset 0 0 ${40 * glowIntensity}px ${20 * glowIntensity}px ${c.inner}
    `;
  };

  // Calculate position for mouse-following mode
  const getFollowPosition = () => {
    if (followMouse && mousePosition) {
      return { x: mousePosition.x, y: mousePosition.y };
    }
    return { x: 0, y: 0 };
  };

  const followPos = getFollowPosition();

  return (
    <motion.div
      className={`relative ${isBackground ? 'pointer-events-none' : ''}`}
      onMouseMove={handleMouseMove}
      style={{
        width,
        height,
        opacity,
      }}
      animate={followMouse && mousePosition ? {
        x: followPos.x,
        y: followPos.y,
      } : undefined}
      transition={followMouse ? {
        type: "spring",
        damping: 20,
        stiffness: 80,
        mass: 0.8,
      } : undefined}
    >
      {/* Main pulse container with breathing expand/contract animation */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        style={{ 
          x: !followMouse && !isBackground ? pulseX : 0, 
          y: !followMouse && !isBackground ? pulseY : 0, 
        }}
        animate={{ 
          scale: breathingPhase !== "idle" 
            ? getBreathingScale() 
            : [0.9, 1.1, 0.9], // Idle heartbeat: 0.9 to 1.1
          opacity: breathingPhase !== "idle" ? getBreathingOpacity() : 1,
        }}
        transition={{
          scale: breathingPhase !== "idle" 
            ? { duration: getBreathingDuration(), ease: breathingPhase === "exhale" ? "easeOut" : "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: getBreathingDuration(), ease: "easeInOut" },
        }}
      >
        {/* Outer ethereal halo - blurred glow layer */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "180%",
            height: "180%",
            background: `radial-gradient(circle, transparent 20%, ${c.mid} 40%, ${c.outer} 60%, transparent 80%)`,
            filter: "blur(50px)",
          }}
          animate={{
            scale: breathingPhase === "hold" ? [1, 1.08, 1] : [1, 1.05, 1],
            opacity: breathingPhase === "hold" ? [0.5, 0.7, 0.5] : [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: breathingPhase === "hold" ? 2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Core pulse element - nearly transparent center, soft glowing edges */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "100%",
            height: "100%",
            background: `radial-gradient(circle, 
              transparent 0%, 
              transparent 25%, 
              ${c.inner} 45%, 
              ${c.mid} 60%, 
              ${c.outer} 75%, 
              transparent 90%
            )`,
            boxShadow: getBoxShadow(),
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
          animate={{
            boxShadow: getBoxShadow(),
          }}
          transition={{
            duration: getBreathingDuration(),
            ease: "easeInOut",
          }}
        />

        {/* Inner soft glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "70%",
            height: "70%",
            background: `radial-gradient(circle, 
              transparent 30%, 
              ${c.inner} 60%, 
              transparent 85%
            )`,
            filter: "blur(25px)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Heartbeat pulse effect - rhythmic throb */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "50%",
            height: "50%",
            background: `radial-gradient(circle, 
              ${c.glow} 0%, 
              ${c.mid} 40%, 
              transparent 70%
            )`,
            filter: "blur(20px)",
          }}
          animate={{
            scale: [1, 1.2, 1.05, 1.25, 1],
            opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.15, 0.3, 0.45, 1],
          }}
        />

        {/* Hold phase - gentle ripple effect */}
        {breathingPhase === "hold" && (
          <>
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "120%",
                height: "120%",
                background: `radial-gradient(circle, transparent 50%, ${c.glow} 70%, transparent 90%)`,
                filter: "blur(20px)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "140%",
                height: "140%",
                background: `radial-gradient(circle, transparent 60%, ${c.mid} 75%, transparent 90%)`,
                filter: "blur(30px)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.35, 0.15],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
