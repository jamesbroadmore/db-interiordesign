import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#6b6862]">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};
