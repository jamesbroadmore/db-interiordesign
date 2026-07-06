import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { api, mediaUrl } from "@/lib/api";

const services = [
  { n: "01", t: "Full-Service Design", d: "End-to-end design from concept to the final cushion, managed by our studio." },
  { n: "02", t: "Renovation & Space Planning", d: "Reimagining how you move through and live in your space." },
  { n: "03", t: "Colour & Material Curation", d: "Warm, tactile palettes and materials chosen to last a lifetime." },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/projects", { params: { featured: true } }).then((r) => setFeatured(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      <Hero />

      {/* Brand story */}
      <section data-testid="brand-story" className="px-6 md:px-12 lg:px-20 py-24 md:py-36 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        <p className="md:col-span-3 text-xs uppercase tracking-[0.2em] text-[#6b6862]">The Studio</p>
        <div className="md:col-span-9">
          <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-[#14110d] max-w-3xl">
            We believe a home should feel as warm as it looks — layered, personal, and quietly luxurious.
          </h2>
          <p className="font-body text-base leading-relaxed text-[#6b6862] mt-8 max-w-2xl">
            Damien Boyle Interiors is a design studio crafting considered residential and select commercial spaces across Australia.
            Every project begins with how you want to live, then builds outward through natural materials, honest craftsmanship and a warm, timeless palette.
          </p>
          <Link to="/about" data-testid="story-more-link" className="inline-flex items-center gap-2 mt-8 text-sm uppercase tracking-[0.15em] text-[#14110d] border-b border-[#14110d] pb-1 hover:text-[#8e9499] hover:border-[#8e9499] transition-colors">
            More about the studio <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Featured projects */}
      <section data-testid="featured-projects" className="px-6 md:px-12 lg:px-20 pb-24 md:pb-36">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-3">Selected Work</p>
            <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight">Featured Projects</h2>
          </div>
          <Link to="/portfolio" className="hidden sm:inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] hover:text-[#8e9499] transition-colors">
            All projects <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={i === 0 ? "md:col-span-7" : "md:col-span-5"}
            >
              <Link to={`/portfolio/${p.id}`} data-testid={`featured-card-${i}`} className="group block">
                <div className="overflow-hidden">
                  <img src={mediaUrl(p.cover_url)} alt={p.title}
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "h-[60vh]" : "h-[46vh]"}`} />
                </div>
                <div className="flex items-baseline justify-between mt-5">
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl">{p.title}</h3>
                    <p className="text-sm text-[#6b6862] mt-1">{p.category} · {p.location}</p>
                  </div>
                  <ArrowUpRight className="text-[#14110d] group-hover:text-[#8e9499] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={22} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services strip */}
      <section data-testid="services-strip" className="bg-[#14110d] text-[#f7f2e9] px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8e9499] mb-12">How We Work</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {services.map((s) => (
            <div key={s.n} className="border-t border-white/15 pt-6">
              <span className="font-display text-4xl text-[#8e9499]">{s.n}</span>
              <h3 className="font-display text-2xl mt-4">{s.t}</h3>
              <p className="font-body text-sm text-white/60 mt-3 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <Link to="/services" data-testid="services-cta" className="inline-flex items-center gap-2 mt-14 border border-white/40 px-8 py-4 text-xs uppercase tracking-[0.18em] hover:bg-white hover:text-[#14110d] transition-colors">
          Explore Services & Pricing <ArrowUpRight size={16} />
        </Link>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-20 py-24 md:py-36 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-6">Begin Your Project</p>
        <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl mx-auto leading-tight">
          Let's design a home you'll never want to leave.
        </h2>
        <Link to="/contact" data-testid="home-cta-btn" className="inline-flex items-center gap-3 mt-10 bg-[#14110d] text-white px-10 py-5 text-xs uppercase tracking-[0.18em] hover:bg-[#8e9499] transition-colors">
          Book a Consultation <ArrowUpRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Home;
