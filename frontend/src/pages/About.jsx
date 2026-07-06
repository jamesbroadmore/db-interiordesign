import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const values = [
  ["Warmth", "Homes should feel inviting — layered textures, soft light and a palette that ages beautifully."],
  ["Craft", "We work with trusted makers and trades who share our obsession with detail."],
  ["Longevity", "Timeless over trend. We design spaces that still feel right in a decade."],
];

const About = () => (
  <div className="pt-32 pb-24 min-h-screen">
    <div className="px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
      <div className="md:col-span-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-4">The Studio</p>
        <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none">Damien Boyle Interiors</h1>
      </div>
      <p className="md:col-span-8 font-body text-lg leading-relaxed text-[#3a352d] md:pt-4">
        Founded on a simple belief — that good design makes everyday life feel better — Damien Boyle Interiors is a studio devoted to warm,
        considered spaces. We approach each project as a collaboration, shaping interiors around how our clients truly live rather than passing trends.
        The result is homes that feel collected, calm and unmistakably personal.
      </p>
    </div>

    <div className="px-6 md:px-12 lg:px-20 mt-16 grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 overflow-hidden">
        <img src="https://images.pexels.com/photos/34688219/pexels-photo-34688219.jpeg" alt="Studio interior" className="w-full h-[65vh] object-cover" />
      </div>
      <div className="md:col-span-4 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1722605090433-41d1183a792d?crop=entropy&cs=srgb&fm=jpg&q=85" alt="Design detail" className="w-full h-[65vh] object-cover" />
      </div>
    </div>

    <section className="px-6 md:px-12 lg:px-20 mt-28">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#14110d]/10 border border-[#14110d]/10">
        {values.map(([t, d]) => (
          <div key={t} className="bg-[#f7f2e9] p-10">
            <h3 className="font-display text-3xl text-[#b08d57]">{t}</h3>
            <p className="font-body text-sm text-[#6b6862] mt-4 leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="px-6 md:px-12 lg:px-20 mt-28 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {[["120+", "Projects delivered"], ["15", "Years of practice"], ["8", "Design awards"], ["100%", "Client-led"]].map(([n, l]) => (
        <div key={l}>
          <div className="font-display text-5xl md:text-6xl text-[#14110d]">{n}</div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mt-3">{l}</div>
        </div>
      ))}
    </section>

    <section className="mt-28 bg-[#14110d] text-white px-6 md:px-12 lg:px-20 py-24 text-center">
      <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl mx-auto">Let's create something you'll love coming home to.</h2>
      <Link to="/contact" className="inline-flex items-center gap-3 mt-10 bg-white text-[#14110d] px-10 py-5 text-xs uppercase tracking-[0.18em] hover:bg-[#b08d57] hover:text-white transition-colors">
        Book a Consultation <ArrowUpRight size={16} />
      </Link>
    </section>
  </div>
);

export default About;
