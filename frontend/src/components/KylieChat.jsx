import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const uid = () => "kylie-" + Math.random().toString(36).slice(2, 11);

export const KylieChat = () => {
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("kylie_session");
    if (existing) return existing;
    const s = uid();
    localStorage.setItem("kylie_session", s);
    return s;
  });
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello, I'm Kylie — Damien's studio concierge. How can I help you today? I can share our services and process, or help you book a consultation." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", phone: "", project_type: "", message: "" });
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const { data } = await api.post("/chat", { session_id: sessionId, message: text });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "I'm having a little trouble right now. Please try the contact form and the studio will reach out." }]);
    } finally {
      setSending(false);
    }
  };

  const submitLead = async (e) => {
    e.preventDefault();
    try {
      await api.post("/chat/lead", { session_id: sessionId, ...lead });
      toast.success("Thank you — the studio will be in touch shortly.");
      setMessages((m) => [...m, { role: "assistant", content: `Wonderful, ${lead.name.split(" ")[0]}. I've passed your details to Damien's studio — we'll reach out to ${lead.email} very soon.` }]);
      setShowLead(false);
      setLead({ name: "", email: "", phone: "", project_type: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <>
      <button
        data-testid="kylie-bubble"
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-6 z-[60] h-16 w-16 rounded-full bg-[#14110d] text-white flex items-center justify-center shadow-2xl hover:bg-[#8e9499] transition-all duration-300 hover:scale-105"
        aria-label="Chat with Kylie"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="kylie-window"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-44 right-6 z-[60] w-[calc(100vw-3rem)] max-w-[400px] h-[560px] max-h-[72vh] flex flex-col backdrop-blur-2xl bg-[#f7f2e9]/95 border border-[#14110d]/10 shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-[#14110d]/10 flex items-center gap-3 bg-[#14110d] text-white">
              <div className="h-10 w-10 rounded-full bg-[#8e9499] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="font-display text-lg leading-none">Kylie</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/60 mt-1">Studio Concierge</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto kylie-scroll px-4 py-5 space-y-4">
              {messages.map((m, i) => (
                <div key={i} data-testid={`kylie-msg-${m.role}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed font-body ${
                    m.role === "user" ? "bg-[#14110d] text-white" : "bg-white border border-[#14110d]/10 text-[#14110d]"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#14110d]/10 px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 rounded-full bg-[#6b6862] animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {showLead ? (
              <form data-testid="kylie-lead-form" onSubmit={submitLead} className="p-4 border-t border-[#14110d]/10 space-y-2 bg-white">
                <input required placeholder="Your name" data-testid="kylie-lead-name" value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  className="w-full border border-[#14110d]/15 px-3 py-2 text-sm bg-[#f7f2e9] focus:outline-none focus:border-[#8e9499]" />
                <input required type="email" placeholder="Email" data-testid="kylie-lead-email" value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  className="w-full border border-[#14110d]/15 px-3 py-2 text-sm bg-[#f7f2e9] focus:outline-none focus:border-[#8e9499]" />
                <input placeholder="Project type (optional)" value={lead.project_type}
                  onChange={(e) => setLead({ ...lead, project_type: e.target.value })}
                  className="w-full border border-[#14110d]/15 px-3 py-2 text-sm bg-[#f7f2e9] focus:outline-none focus:border-[#8e9499]" />
                <div className="flex gap-2 pt-1">
                  <button type="submit" data-testid="kylie-lead-submit" className="flex-1 bg-[#14110d] text-white py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-[#8e9499] transition-colors">Send</button>
                  <button type="button" onClick={() => setShowLead(false)} className="px-4 border border-[#14110d]/20 text-xs uppercase tracking-[0.15em]">Back</button>
                </div>
              </form>
            ) : (
              <div className="border-t border-[#14110d]/10 bg-white">
                <button data-testid="kylie-book-cta" onClick={() => setShowLead(true)}
                  className="w-full py-2.5 text-[11px] uppercase tracking-[0.18em] text-[#8e9499] hover:bg-[#f7f2e9] transition-colors border-b border-[#14110d]/5">
                  Book a Consultation
                </button>
                <div className="p-3 flex items-center gap-2">
                  <input
                    data-testid="kylie-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask Kylie anything..."
                    className="flex-1 border border-[#14110d]/15 px-3 py-2.5 text-sm bg-[#f7f2e9] focus:outline-none focus:border-[#8e9499]"
                  />
                  <button data-testid="kylie-send" onClick={send} disabled={sending}
                    className="h-10 w-10 flex items-center justify-center bg-[#14110d] text-white hover:bg-[#8e9499] transition-colors disabled:opacity-50">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
