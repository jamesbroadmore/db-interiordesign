import { useState } from "react";
import { Mail, Phone, MapPin, Check } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", project_type: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bookings", { ...form, source: "contact_form" });
      setSent(true);
      toast.success("Thank you — the studio will be in touch soon.");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-12 gap-16">
      <div className="md:col-span-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6b6862] mb-4">Contact</p>
        <h1 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none">Book a consultation.</h1>
        <p className="font-body text-base text-[#6b6862] mt-8 leading-relaxed max-w-md">
          Tell us a little about your project and we'll be in touch to arrange your discovery consultation. Prefer to chat first? Kylie, our concierge, is here around the clock.
        </p>
        <div className="mt-12 space-y-5 font-body text-sm text-[#3a352d]">
          <div className="flex items-center gap-4"><Mail size={18} className="text-[#8e9499]" /> hello@boyleinteriors.com</div>
          <div className="flex items-center gap-4"><Phone size={18} className="text-[#8e9499]" /> +61 2 8000 4000</div>
          <div className="flex items-center gap-4"><MapPin size={18} className="text-[#8e9499]" /> Sydney · Melbourne · By appointment</div>
        </div>
      </div>

      <div className="md:col-span-7">
        {sent ? (
          <div data-testid="booking-success" className="border border-[#14110d]/10 bg-white p-12 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-[#8e9499] flex items-center justify-center text-white mb-6"><Check size={30} /></div>
            <h3 className="font-display text-3xl">Request received</h3>
            <p className="font-body text-[#6b6862] mt-4 max-w-sm">Thank you for reaching out. Damien's studio will contact you shortly to arrange your consultation.</p>
          </div>
        ) : (
          <form data-testid="booking-form" onSubmit={submit} className="border border-[#14110d]/10 bg-white p-8 md:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Full name" required value={form.name} testid="booking-name" onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Email" type="email" required value={form.email} testid="booking-email" onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" value={form.phone} testid="booking-phone" onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Project type" value={form.project_type} testid="booking-project-type" onChange={(v) => setForm({ ...form, project_type: v })} placeholder="e.g. Full home, Kitchen" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-[#6b6862]">Tell us about your project</label>
              <textarea data-testid="booking-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full mt-2 border border-[#14110d]/15 px-4 py-3 bg-[#f7f2e9] text-sm focus:outline-none focus:border-[#8e9499]" />
            </div>
            <button data-testid="booking-submit" disabled={loading}
              className="w-full bg-[#14110d] text-white py-4 text-xs uppercase tracking-[0.18em] hover:bg-[#8e9499] transition-colors disabled:opacity-60">
              {loading ? "Sending…" : "Request Consultation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", required, testid, placeholder }) => (
  <div>
    <label className="text-xs uppercase tracking-[0.15em] text-[#6b6862]">{label}{required && " *"}</label>
    <input data-testid={testid} type={type} required={required} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-2 border border-[#14110d]/15 px-4 py-3 bg-[#f7f2e9] text-sm focus:outline-none focus:border-[#8e9499]" />
  </div>
);

export default Contact;
