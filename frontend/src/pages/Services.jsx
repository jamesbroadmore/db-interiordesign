import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";

const offerings = [
  { t: "Full-Service Interior Design", d: "A complete, studio-managed journey from first concept to final styling — ideal for whole-home projects." },
  { t: "Residential Styling", d: "Refresh and elevate individual rooms with curated furniture, art and finishing touches." },
  { t: "Renovation & Space Planning", d: "Structural and spatial planning that reimagines how you move through your home." },
  { t: "Colour & Material Consultation", d: "Warm, tactile palettes and durable materials chosen to suit your light and lifestyle." },
  { t: "Bespoke Furniture Curation", d: "Custom and sourced pieces tailored to your space and story." },
  { t: "Commercial Interiors", d: "Considered, brand-aligned spaces for select hospitality and workspace clients." },
];

const process = [
  ["01", "Discovery Consultation", "We learn how you live, your taste and your ambitions for the space."],
  ["02", "Concept & Moodboards", "Direction, palettes and references that set the tone for your home."],
  ["03", "Design Development", "Detailed plans, 3D visuals and material selections brought together."],
  ["04", "Procurement & Management", "We source, order and manage trades so you don't have to."],
  ["05", "Styling & Reveal", "The final layer — styled, photographed and ready to be lived in."],
];

const pricing = [
  { t: "Consultation", p: "from $250", note: "In-studio or on-site discovery session", items: ["90-minute session", "Tailored advice", "Clear next steps"] },
  { t: "Room Styling", p: "from $2,500", note: "Per-room styling packages", items: ["Concept & moodboard", "Furniture & decor sourcing", "Styling day"], featured: true },
  { t: "Full-Home Design", p: "bespoke, from $15,000", note: "Quoted to scope", items: ["End-to-end design", "3D visualisation", "Project management"] },
];

const Services = () => (
  <div className="pt-32 pb-24 min-h-screen">
    <div className="px-6 md:px-12 lg:px-20">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-4">Services</p>
      <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl leading-none">Design, styling and everything in between.</h1>
    </div>

    <div className="px-6 md:px-12 lg:px-20 mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#14110d]/10 border border-[#14110d]/10">
      {offerings.map((o) => (
        <div key={o.t} className="bg-[#f7f2e9] p-10 hover:bg-white transition-colors">
          <h3 className="font-display text-2xl">{o.t}</h3>
          <p className="font-body text-sm text-[#6b6862] mt-4 leading-relaxed">{o.d}</p>
        </div>
      ))}
    </div>

    {/* Process */}
    <section className="px-6 md:px-12 lg:px-20 mt-28">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-10">Our Process</p>
      <div className="space-y-px bg-[#14110d]/10">
        {process.map(([n, t, d]) => (
          <div key={n} className="bg-[#f7f2e9] grid grid-cols-1 md:grid-cols-12 gap-4 py-8 items-baseline">
            <span className="md:col-span-2 font-display text-4xl text-[#8e9499]">{n}</span>
            <h3 className="md:col-span-4 font-display text-2xl">{t}</h3>
            <p className="md:col-span-6 font-body text-sm text-[#6b6862] leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Pricing */}
    <section className="px-6 md:px-12 lg:px-20 mt-28">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-10">Pricing Overview</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricing.map((c) => (
          <div key={c.t} data-testid={`pricing-${c.t.toLowerCase().replace(/\s/g, "-")}`}
            className={`p-10 border ${c.featured ? "bg-[#14110d] text-white border-[#14110d]" : "bg-white border-[#14110d]/10"}`}>
            <h3 className="font-display text-2xl">{c.t}</h3>
            <div className={`font-display text-3xl mt-4 ${c.featured ? "text-[#8e9499]" : "text-[#14110d]"}`}>{c.p}</div>
            <p className={`text-sm mt-2 ${c.featured ? "text-white/60" : "text-[#6b6862]"}`}>{c.note}</p>
            <ul className="mt-6 space-y-3">
              {c.items.map((it) => (
                <li key={it} className={`flex items-center gap-3 text-sm ${c.featured ? "text-white/80" : "text-[#6b6862]"}`}>
                  <Check size={16} className="text-[#8e9499]" /> {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-sm text-[#6b6862] mt-6">All projects are quoted individually. Book a consultation for an accurate estimate.</p>
    </section>

    <section className="mt-28 bg-[#14110d] text-white px-6 md:px-12 lg:px-20 py-24 text-center">
      <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl mx-auto">Ready to start? Kylie or our team can help.</h2>
      <Link to="/contact" data-testid="services-page-cta" className="inline-flex items-center gap-3 mt-10 bg-white text-[#14110d] px-10 py-5 text-xs uppercase tracking-[0.18em] hover:bg-[#8e9499] hover:text-white transition-colors">
        Book a Consultation <ArrowUpRight size={16} />
      </Link>
    </section>
  </div>
);

export default Services;
