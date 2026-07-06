import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

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

    {/* Bespoke approach (no pricing) */}
    <section className="px-6 md:px-12 lg:px-20 mt-28">
      <div className="bg-[#14110d] text-white p-12 md:p-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8e9499] mb-5">A Bespoke Approach</p>
          <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
            Every project is tailored to you.
          </h2>
          <p className="font-body text-base text-white/65 mt-6 leading-relaxed max-w-xl">
            No two homes — or clients — are the same, so we scope each engagement individually. Share your vision with us and we'll prepare a considered proposal designed entirely around your space, timeline and lifestyle.
          </p>
        </div>
        <div className="md:col-span-5 md:text-right">
          <Link to="/contact" data-testid="services-bespoke-cta"
            className="inline-flex items-center gap-3 bg-white text-[#14110d] px-10 py-5 text-xs uppercase tracking-[0.18em] hover:bg-[#8e9499] hover:text-white transition-colors">
            Request a Proposal <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
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
