import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { TopRightMenu } from "@/components/TopRightMenu";
import { ChatView } from "@/components/ChatView";
import { BreatheView } from "@/components/BreatheView";
import { AboutView } from "@/components/AboutView";

type Tab = "chat" | "breathe" | "about";

interface Message {
  id: number;
  text: string;
  sender: "user" | "veda";
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  
  // Chat state lifted to persist across tab changes
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const scrollPositionRef = useRef<number>(0);

  const renderView = () => {
    switch (activeTab) {
      case "chat":
        return (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            hasStartedConversation={hasStartedConversation}
            setHasStartedConversation={setHasStartedConversation}
            scrollPositionRef={scrollPositionRef}
          />
        );
      case "breathe":
        return <BreatheView />;
      case "about":
        return <AboutView />;
      default:
        return (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            hasStartedConversation={hasStartedConversation}
            setHasStartedConversation={setHasStartedConversation}
            scrollPositionRef={scrollPositionRef}
          />
        );
    }
  };

  // Use deep black background for breathe mode
  const isBreatheMode = activeTab === "breathe";

  return (
    <div
      className={`min-h-screen overflow-hidden relative transition-all duration-700 ${
        isBreatheMode ? "bg-background" : "gradient-nordic"
      }`}
    >
      {/* Navigation - Top Left */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Top Right Menu - About & Exit */}
      <TopRightMenu activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Ambient particles - only show when not in breathe mode */}
      {!isBreatheMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-orb-glow/20"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;