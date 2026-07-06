import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

const AdminLogin = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#14110d] px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-logo text-4xl text-white">Damien Boyle</div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8e9499] mt-3">Studio Administration</p>
        </div>
        <form data-testid="admin-login-form" onSubmit={submit} className="bg-[#f7f2e9] p-10 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-[#6b6862]">Email</label>
            <input data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 border border-[#14110d]/15 px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#8e9499]" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] text-[#6b6862]">Password</label>
            <input data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 border border-[#14110d]/15 px-4 py-3 bg-white text-sm focus:outline-none focus:border-[#8e9499]" />
          </div>
          {error && <p data-testid="login-error" className="text-sm text-[#9A3E3E]">{error}</p>}
          <button data-testid="login-submit" disabled={loading}
            className="w-full bg-[#14110d] text-white py-4 text-xs uppercase tracking-[0.18em] hover:bg-[#8e9499] transition-colors disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
