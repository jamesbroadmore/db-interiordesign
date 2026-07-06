import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [cats, setCats] = useState(["All"]);

  useEffect(() => {
    api.get("/projects").then((r) => {
      setProjects(r.data);
      setCats(["All", ...Array.from(new Set(r.data.map((p) => p.category)))]);
    }).catch(() => {});
  }, []);

  const visible = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 lg:px-20 min-h-screen">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-4">Portfolio</p>
      <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight max-w-3xl leading-none">
        A collection of warm, considered spaces.
      </h1>

      <div data-testid="portfolio-filters" className="flex flex-wrap gap-3 mt-12 mb-14">
        {cats.map((c) => (
          <button
            key={c}
            data-testid={`filter-${c.toLowerCase()}`}
            onClick={() => setFilter(c)}
            className={`px-6 py-2.5 text-xs uppercase tracking-[0.15em] border transition-colors ${
              filter === c ? "bg-[#14110d] text-white border-[#14110d]" : "border-[#14110d]/20 text-[#14110d] hover:border-[#8e9499] hover:text-[#8e9499]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
        {visible.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className={i % 3 === 0 ? "md:col-span-2" : ""}>
            <Link to={`/portfolio/${p.id}`} data-testid={`project-card-${p.id}`} className="group block">
              <div className="overflow-hidden">
                <img src={mediaUrl(p.cover_url)} alt={p.title}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i % 3 === 0 ? "h-[65vh]" : "h-[52vh]"}`} />
              </div>
              <div className="flex items-baseline justify-between mt-5">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl">{p.title}</h3>
                  <p className="text-sm text-[#6b6862] mt-1">{p.category} · {p.location} · {p.year}</p>
                </div>
                <ArrowUpRight className="group-hover:text-[#8e9499] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={22} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      {visible.length === 0 && <p className="text-[#6b6862] mt-8">No projects in this category yet.</p>}
    </div>
  );
};

export default Portfolio;
