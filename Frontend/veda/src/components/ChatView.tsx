import { useState, useRef, useEffect, Dispatch, SetStateAction, MutableRefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BioluminescentPulse } from "./BioluminescentPulse";
import { Send } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "veda";
}

interface ChatViewProps {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  hasStartedConversation: boolean;
  setHasStartedConversation: Dispatch<SetStateAction<boolean>>;
  scrollPositionRef: MutableRefObject<number>;
}



export const ChatView = ({
  messages,
  setMessages,
  hasStartedConversation,
  setHasStartedConversation,
  scrollPositionRef,
}: ChatViewProps) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Restore scroll position when returning to chat
  useEffect(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [scrollPositionRef]);

  // Save scroll position on scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (hasStartedConversation) {
      scrollToBottom();
    }
  }, [messages, hasStartedConversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: message.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setHasStartedConversation(true);
    setIsTyping(true);

    (async () => {
  try {
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        session_id: "local-session"
      }),
    });

    const data = await response.json();

    const vedaMessage: Message = {
      id: Date.now() + 1,
      text: data.reply,
      sender: "veda",
    };

    setMessages((prev) => [...prev, vedaMessage]);
  } catch (error) {
    const errorMessage: Message = {
      id: Date.now() + 1,
      text: "Something went quiet on my end. I'm still here with you.",
      sender: "veda",
    };
    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsTyping(false);
  }
})();

  };

  return (
    <div className="relative flex flex-col items-center min-h-[80vh] pt-20">
      {/* Bioluminescent Pulse - z-index behind chat text, 20% opacity when conversation starts */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: -1 }}
        animate={{
          scale: hasStartedConversation ? 1.3 : 1,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <div className={hasStartedConversation ? "" : "pointer-events-auto"}>
          <BioluminescentPulse 
            breathingPhase="idle" 
            size="large"
            isBackground={hasStartedConversation}
            opacity={hasStartedConversation ? 0.2 : 1}
          />
        </div>
      </motion.div>

      {/* Welcome message or conversation */}
      <div className="flex-1 w-full max-w-2xl flex flex-col px-4 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          {!hasStartedConversation ? (
            <motion.div
              key="welcome"
              className="flex-1 flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xl md:text-2xl font-light text-silver tracking-wide text-center">
                Hello, how are you feeling today?
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto py-8 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`glass rounded-2xl px-5 py-3 max-w-[75%] ${
                      msg.sender === "user"
                        ? "bg-accent/20 text-foreground"
                        : "bg-muted/30 text-silver"
                    }`}
                  >
                    <p className="text-sm font-light leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="glass rounded-2xl px-5 py-3 bg-muted/30">
                      <div className="flex items-center gap-1">
                        <motion.span
                          className="w-2 h-2 rounded-full bg-silver/60"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full bg-silver/60"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="w-2 h-2 rounded-full bg-silver/60"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hint text below pulse - only show before conversation */}
      {!hasStartedConversation && (
        <motion.p
          className="text-xs text-muted-foreground/50 font-light mb-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Hover over the pulse to interact
        </motion.p>
      )}

      {/* Chat input - glassmorphic, centered at bottom */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-xl px-4 mb-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="glass rounded-full px-6 py-3 flex items-center gap-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Talk to Veda..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 font-light focus:outline-none"
          />
          <button
            type="submit"
            className="p-2 rounded-full bg-accent/30 hover:bg-accent/50 transition-colors duration-300 text-foreground/80 hover:text-foreground"
          >
            <Send className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </motion.form>
    </div>
  );
};