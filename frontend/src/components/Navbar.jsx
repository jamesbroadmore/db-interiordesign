import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "Studio" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl bg-[#f7f2e9]/85 border-b border-[#14110d]/10" : "bg-transparent"
      }`}
    >
      <div className="px-6 md:px-12 lg:px-20 flex items-center justify-between h-20">
        <Link to="/" data-testid="nav-logo" className="font-logo text-2xl md:text-3xl tracking-wide text-[#14110d] leading-none">
          Damien Boyle
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={`font-body text-sm uppercase tracking-[0.15em] transition-colors relative group ${
                pathname === l.to ? "text-[#b08d57]" : "text-[#14110d] hover:text-[#b08d57]"
              }`}
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px bg-[#b08d57] transition-all duration-300 w-0 group-hover:w-full" />
            </Link>
          ))}
          <Link
            to="/contact"
            data-testid="nav-book-btn"
            className="bg-[#14110d] text-white px-6 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[#b08d57] transition-colors"
          >
            Book Consultation
          </Link>
        </nav>

        <button data-testid="nav-mobile-toggle" className="md:hidden text-[#14110d]" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div data-testid="mobile-menu" className="md:hidden bg-[#f7f2e9] border-t border-[#14110d]/10 px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="font-body text-sm uppercase tracking-[0.15em] text-[#14110d]">
              {l.label}
            </Link>
          ))}
          <Link to="/contact" className="bg-[#14110d] text-white px-6 py-3 text-xs uppercase tracking-[0.18em] text-center">
            Book Consultation
          </Link>
        </div>
      )}
    </header>
  );
};
