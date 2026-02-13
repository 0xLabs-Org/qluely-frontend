import React from "react";
import { Monitor, Laptop, Apple, Terminal } from "lucide-react";
import { StoreBadge } from "@/components/StoreBadge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DownloadCard } from "@/components/downloads/DownloadItem";

export interface DownloadItem {
  id: string;
  name: string;
  storeName: string;
  storeIconType:
  | "microsoft"
  | "apple"
  | "snap"
  | "playstore"
  | "galaxy"
  | "firefox"
  | "chrome"
  | "opera";
  href: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

export interface DownloadCategory {
  title: string;
  description: string;
  headerIcons: React.ReactNode;
  items: DownloadItem[];
}

const categories: DownloadCategory = {
  title: "Desktops",
  description: "Get it on your desktops",
  headerIcons: (
    <>
      <Monitor size={24} />
      <Laptop size={24} />
    </>
  ),
  items: [
    {
      id: "win",
      name: "Windows 11",
      storeName: "Microsoft",
      storeIconType: "microsoft",
      href: "#",
      icon: (
        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0v11.408h11.408V0H0zm12.592 0v11.408H24V0h-11.408zM0 12.592V24h11.408V12.592H0zm12.592 0V24H24V12.592h-11.408z" />
        </svg>
      ),
      comingSoon: true,
    },
    {
      id: "mac",
      name: "MacOS",
      storeName: "Mac App Store",
      storeIconType: "apple",
      href: "#",
      icon: <Apple className="w-6 h-6 text-gray-900" />,
      comingSoon: true,
    },
    {
      id: "linux",
      name: "Linux",
      storeName: "Snap Store",
      storeIconType: "snap",
      href: "#",
      icon: (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg"
          className="w-7 h-7"
          alt="Linux"
        />
      ),
      comingSoon: true,
    },
  ],
};
export const DownloadSection = () => {
  return (
    <section className="relative px-6 max-w-7xl mx-auto grid-background overflow-hidden">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 tracking-tight">
          Download for all your devices
        </h2>
        <div className="max-w-3xl mx-auto space-y-2 text-center">
          <p className="text-slate-500 text-lg">
            Download Qluely and keep your private AI meeting assistant with you,
          </p>
          <p className="text-slate-500 text-lg">At your desk, in interviews, and on every call</p>
        </div>
      </div>

      <div className="relative z-10">
        <DownloadCard key={categories.title} category={categories} />
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 translate-x-1/2 w-96 h-96 bg-purple-100 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
    </section>
  );
};

export default function DownloadsPage() {
  return (
    <>
      <Navigation className="px-6 py-2 z-1" />
      <div className="min-h-screen bg-slate-50 py-20">
        <DownloadSection />
      </div>
      {/* footer */}
      <Footer />
    </>
  );
}
