import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api, mediaUrl, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Upload, X, Pencil, Image as ImageIcon } from "lucide-react";

const empty = { title: "", category: "Residential", location: "", year: "", description: "", cover_url: "", images: [], featured: false };

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);

  const loadBookings = () => api.get("/bookings").then((r) => setBookings(r.data)).catch(() => {});
  const loadProjects = () => api.get("/projects").then((r) => setProjects(r.data)).catch(() => {});

  useEffect(() => { loadBookings(); loadProjects(); }, []);

  const doLogout = () => { logout(); nav("/admin/login"); };

  const setStatus = async (id, status) => {
    await api.put(`/bookings/${id}`, { status });
    loadBookings();
  };
  const delBooking = async (id) => { await api.delete(`/bookings/${id}`); loadBookings(); };
  const delProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`); loadProjects();
  };

  const newCount = bookings.filter((b) => b.status === "new").length;

  return (
    <div className="min-h-screen bg-[#efe8db]">
      <header className="bg-[#14110d] text-white px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="font-logo text-2xl leading-none">Damien Boyle</div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Studio Admin</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-white/70 hidden sm:block">{user?.email}</span>
          <button data-testid="admin-logout" onClick={doLogout} className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] hover:text-[#b08d57]"><LogOut size={16} /> Logout</button>
        </div>
      </header>

      <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex gap-2 mb-8 border-b border-[#14110d]/10">
          {[["bookings", `Bookings${newCount ? ` (${newCount} new)` : ""}`], ["projects", "Gallery & Projects"]].map(([k, l]) => (
            <button key={k} data-testid={`tab-${k}`} onClick={() => setTab(k)}
              className={`px-6 py-3 text-sm uppercase tracking-[0.12em] border-b-2 -mb-px transition-colors ${
                tab === k ? "border-[#b08d57] text-[#14110d]" : "border-transparent text-[#6b6862] hover:text-[#14110d]"}`}>{l}</button>
          ))}
        </div>

        {tab === "bookings" && (
          <div data-testid="bookings-panel">
            {bookings.length === 0 && <p className="text-[#6b6862]">No bookings yet.</p>}
            <div className="grid gap-4">
              {bookings.map((b) => (
                <div key={b.id} data-testid={`booking-${b.id}`} className="bg-white border border-[#14110d]/10 p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-3">
                    <div className="font-display text-xl">{b.name}</div>
                    <div className="text-sm text-[#6b6862]">{b.email}</div>
                    {b.phone && <div className="text-sm text-[#6b6862]">{b.phone}</div>}
                  </div>
                  <div className="md:col-span-5">
                    {b.project_type && <div className="text-xs uppercase tracking-wide text-[#b08d57] mb-1">{b.project_type}</div>}
                    <p className="text-sm text-[#3a352d]">{b.message || "—"}</p>
                    <div className="text-xs text-[#999] mt-2">{new Date(b.created_at).toLocaleString()} · via {b.source === "kylie_chat" ? "Kylie" : "Contact form"}</div>
                  </div>
                  <div className="md:col-span-4 flex flex-wrap gap-2 md:justify-end">
                    <select data-testid={`booking-status-${b.id}`} value={b.status} onChange={(e) => setStatus(b.id, e.target.value)}
                      className="border border-[#14110d]/15 px-3 py-2 text-xs bg-[#f7f2e9]">
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="booked">Booked</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button onClick={() => delBooking(b.id)} className="p-2 border border-[#14110d]/15 hover:bg-[#9A3E3E] hover:text-white transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div data-testid="projects-panel">
            <button data-testid="new-project-btn" onClick={() => setEditing(empty)}
              className="flex items-center gap-2 bg-[#14110d] text-white px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-[#b08d57] transition-colors mb-8"><Plus size={16} /> New Project</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} data-testid={`admin-project-${p.id}`} className="bg-white border border-[#14110d]/10">
                  <div className="h-48 overflow-hidden bg-[#eee]">
                    {p.cover_url ? <img src={mediaUrl(p.cover_url)} alt={p.title} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#ccc]"><ImageIcon size={40} /></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl">{p.title}</h3>
                      {p.featured && <span className="text-[10px] uppercase tracking-wide bg-[#b08d57] text-white px-2 py-0.5">Featured</span>}
                    </div>
                    <p className="text-sm text-[#6b6862] mt-1">{p.category} · {p.images?.length || 0} images</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setEditing(p)} className="flex-1 flex items-center justify-center gap-2 border border-[#14110d]/15 py-2 text-xs uppercase tracking-wide hover:bg-[#14110d] hover:text-white transition-colors"><Pencil size={14} /> Edit</button>
                      <button onClick={() => delProject(p.id)} className="p-2 border border-[#14110d]/15 hover:bg-[#9A3E3E] hover:text-white transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editing && <ProjectEditor project={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); loadProjects(); }} />}
    </div>
  );
};

const ProjectEditor = ({ project, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...project, images: project.images || [] });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadFiles = async (files) => {
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploaded.push({ id: crypto.randomUUID(), url: data.url, order: 0 });
      }
      setForm((f) => {
        const images = [...f.images, ...uploaded];
        return { ...f, images, cover_url: f.cover_url || uploaded[0]?.url || "" };
      });
      toast.success("Images uploaded");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (id) => setForm((f) => ({ ...f, images: f.images.filter((i) => i.id !== id) }));

  const save = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = { ...form, images: form.images.map((im, idx) => ({ ...im, order: idx })), cover_url: form.cover_url || form.images[0]?.url || "" };
    try {
      if (form.id) await api.put(`/projects/${form.id}`, payload);
      else await api.post("/projects", payload);
      toast.success("Project saved");
      onSaved();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-10 px-4" onClick={onClose}>
      <div data-testid="project-editor" className="bg-[#f7f2e9] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#14110d]/10 bg-white">
          <h2 className="font-display text-2xl">{form.id ? "Edit Project" : "New Project"}</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <In label="Title *" v={form.title} on={(v) => set("title", v)} testid="editor-title" />
            <In label="Category" v={form.category} on={(v) => set("category", v)} testid="editor-category" />
            <In label="Location" v={form.location} on={(v) => set("location", v)} testid="editor-location" />
            <In label="Year" v={form.year} on={(v) => set("year", v)} testid="editor-year" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-[#6b6862]">Description</label>
            <textarea data-testid="editor-description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full mt-2 border border-[#14110d]/15 px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#b08d57]" />
          </div>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input data-testid="editor-featured" type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[#b08d57]" />
            Show on homepage (Featured)
          </label>

          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-[#6b6862]">Gallery Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
              {form.images.map((img) => (
                <div key={img.id} className={`relative group aspect-square ${form.cover_url === img.url ? "ring-2 ring-[#b08d57]" : ""}`}>
                  <img src={mediaUrl(img.url)} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => set("cover_url", img.url)} title="Set as cover" />
                  <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  {form.cover_url === img.url && <span className="absolute bottom-0 left-0 right-0 bg-[#b08d57] text-white text-[9px] text-center py-0.5 uppercase tracking-wide">Cover</span>}
                </div>
              ))}
              <button data-testid="editor-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="aspect-square border border-dashed border-[#14110d]/30 flex flex-col items-center justify-center gap-1 text-[#6b6862] hover:border-[#b08d57] hover:text-[#b08d57] transition-colors">
                {uploading ? <span className="text-xs">Uploading…</span> : <><Upload size={20} /><span className="text-[10px] uppercase">Add</span></>}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files.length && uploadFiles(Array.from(e.target.files))} />
          </div>
        </div>
        <div className="px-8 py-5 border-t border-[#14110d]/10 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 border border-[#14110d]/20 text-xs uppercase tracking-[0.15em]">Cancel</button>
          <button data-testid="editor-save" onClick={save} disabled={saving} className="px-8 py-3 bg-[#14110d] text-white text-xs uppercase tracking-[0.15em] hover:bg-[#b08d57] transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Project"}
          </button>
        </div>
      </div>
    </div>
  );
};

const In = ({ label, v, on, testid }) => (
  <div>
    <label className="text-xs uppercase tracking-[0.15em] text-[#6b6862]">{label}</label>
    <input data-testid={testid} value={v || ""} onChange={(e) => on(e.target.value)}
      className="w-full mt-2 border border-[#14110d]/15 px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#b08d57]" />
  </div>
);

export default AdminDashboard;
