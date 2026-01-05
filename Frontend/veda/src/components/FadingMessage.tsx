import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const messages = [
  "Take a moment to breathe.",
  "You are safe here.",
  "Let go of what you cannot control.",
  "This moment is enough.",
  "Be gentle with yourself.",
  "You are doing better than you think.",
  "Peace begins within.",
];

interface FadingMessageProps {
  isVisible: boolean;
}

export const FadingMessage = ({ isVisible }: FadingMessageProps) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={currentMessage}
          className="fixed top-1/4 left-1/2 -translate-x-1/2 text-center max-w-md px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <p className="text-xl md:text-2xl font-light text-silver tracking-wide leading-relaxed">
            {messages[currentMessage]}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
