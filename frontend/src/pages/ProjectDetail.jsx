import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";

const ProjectDetail = () => {
  const { id } = useParams();
  const [p, setP] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/projects/${id}`).then((r) => setP(r.data)).catch(() => setP(false));
  }, [id]);

  if (p === false) return <div className="pt-40 text-center min-h-screen">Project not found. <Link to="/portfolio" className="underline">Back to portfolio</Link></div>;
  if (!p) return <div className="pt-40 text-center min-h-screen text-[#6b6862]">Loading…</div>;

  return (
    <div className="pt-24 min-h-screen" data-testid="project-detail">
      <div className="h-[75vh] w-full overflow-hidden">
        <img src={mediaUrl(p.cover_url)} alt={p.title} className="w-full h-full object-cover" />
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#6b6862] hover:text-[#14110d] mb-8"><ArrowLeft size={16} /> Portfolio</Link>
          <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none">{p.title}</h1>
          <p className="font-body text-base leading-relaxed text-[#6b6862] mt-8 max-w-2xl">{p.description}</p>
        </div>
        <div className="md:col-span-4 md:border-l md:border-[#14110d]/10 md:pl-10 space-y-6 pt-4">
          {[["Category", p.category], ["Location", p.location], ["Year", p.year]].map(([k, v]) => v && (
            <div key={k}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b6862]">{k}</div>
              <div className="font-display text-xl mt-1">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        {(p.images || []).map((img, i) => (
          <div key={img.id || i} className={`overflow-hidden ${i % 3 === 0 ? "md:col-span-2" : ""}`}>
            <img src={mediaUrl(img.url)} alt={`${p.title} ${i + 1}`} className="w-full h-[60vh] object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        ))}
      </div>

      <section className="bg-[#14110d] text-white px-6 md:px-12 lg:px-20 py-24 text-center">
        <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl mx-auto">Love this style? Let's create yours.</h2>
        <Link to="/contact" className="inline-flex items-center gap-3 mt-10 bg-white text-[#14110d] px-10 py-5 text-xs uppercase tracking-[0.18em] hover:bg-[#b08d57] hover:text-white transition-colors">
          Book a Consultation <ArrowUpRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default ProjectDetail;
