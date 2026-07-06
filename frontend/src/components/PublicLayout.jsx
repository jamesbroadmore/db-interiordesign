import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { KylieChat } from "@/components/KylieChat";

export const PublicLayout = () => (
  <div className="min-h-screen bg-[#f7f2e9]">
    <Navbar />
    <main><Outlet /></main>
    <Footer />
    <KylieChat />
  </div>
);
