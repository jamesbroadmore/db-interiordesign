import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const rooms = [
  { url: "https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg", label: "The Living Room" },
  { url: "https://images.pexels.com/photos/8135248/pexels-photo-8135248.jpeg", label: "The Bedroom" },
  { url: "https://images.unsplash.com/photo-1671197244266-73129c97c096?crop=entropy&cs=srgb&fm=jpg&q=85", label: "The Kitchen" },
  { url: "https://images.pexels.com/photos/14598479/pexels-photo-14598479.jpeg", label: "The Dining Room" },
  { url: "https://images.pexels.com/photos/13722826/pexels-photo-13722826.jpeg", label: "The Lounge" },
];

export const Hero = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % rooms.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section data-testid="hero-section" className="relative h-screen w-full overflow-hidden bg-[#14110d]">
      <AnimatePresence>
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={rooms[idx].url}
            alt={rooms[idx].label}
            className="w-full h-full object-cover ken-burns"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/40" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-28 px-6 md:px-12 lg:px-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xs uppercase tracking-[0.3em] text-[#cfd3d8] mb-6"
        >
          Interior Design Studio · Perth, Australia
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.9 }}
          className="font-display font-light text-white text-4xl sm:text-6xl lg:text-7xl leading-[0.95] max-w-4xl tracking-tight"
        >
          Warm, considered homes<br />designed to be lived in.
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link to="/portfolio" data-testid="hero-portfolio-btn"
            className="group inline-flex items-center gap-3 bg-[#f7f2e9] text-[#14110d] px-8 py-4 text-xs uppercase tracking-[0.18em] hover:bg-[#8e9499] hover:text-white transition-colors">
            View Portfolio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/contact" data-testid="hero-book-btn"
            className="inline-flex items-center justify-center border border-white/50 text-white px-8 py-4 text-xs uppercase tracking-[0.18em] hover:bg-white hover:text-[#14110d] transition-colors">
            Book a Consultation
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-8 right-6 md:right-12 lg:right-20 z-10 flex items-center gap-4">
        <span className="font-display text-white/80 text-lg italic">{rooms[idx].label}</span>
        <div className="flex gap-2">
          {rooms.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Show ${rooms[i].label}`}
              className={`h-px transition-all duration-500 ${i === idx ? "w-10 bg-[#8e9499]" : "w-5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
