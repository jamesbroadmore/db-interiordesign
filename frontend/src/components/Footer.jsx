import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

export const Footer = () => (
  <footer data-testid="main-footer" className="bg-[#14110d] text-[#f7f2e9]">
    <div className="px-6 md:px-12 lg:px-20 py-20 grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-5">
        <div className="font-logo text-3xl mb-5">Damien Boyle</div>
        <p className="font-body text-sm leading-relaxed text-white/60 max-w-sm">
          A premium interior design studio crafting warm, considered homes — from concept to final styling.
        </p>
      </div>
      <div className="md:col-span-3">
        <div className="text-xs uppercase tracking-[0.2em] text-[#b08d57] mb-5">Explore</div>
        <ul className="space-y-3 font-body text-sm text-white/70">
          <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
          <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
          <li><Link to="/about" className="hover:text-white transition-colors">The Studio</Link></li>
          <li><Link to="/contact" className="hover:text-white transition-colors">Book a Consultation</Link></li>
        </ul>
      </div>
      <div className="md:col-span-4">
        <div className="text-xs uppercase tracking-[0.2em] text-[#b08d57] mb-5">Studio</div>
        <ul className="space-y-3 font-body text-sm text-white/70">
          <li className="flex items-center gap-3"><Mail size={16} /> hello@boyleinteriors.com</li>
          <li className="flex items-center gap-3"><Phone size={16} /> +61 2 8000 4000</li>
          <li className="flex items-center gap-3"><Instagram size={16} /> @damienboyleinteriors</li>
        </ul>
      </div>
    </div>
    <div className="px-6 md:px-12 lg:px-20 py-6 border-t border-white/10 flex flex-col md:flex-row justify-between gap-3 text-xs text-white/40 font-body">
      <span>© {new Date().getFullYear()} Damien Boyle Interiors. All rights reserved.</span>
      <Link to="/admin/login" data-testid="footer-admin-link" className="hover:text-white/70 transition-colors">Studio Login</Link>
    </div>
  </footer>
);
