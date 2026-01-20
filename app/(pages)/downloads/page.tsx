import React from "react";
import { Monitor, Laptop } from "lucide-react";
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
    },
    { id: "mac", name: "MacOS", storeName: "Mac App Store", storeIconType: "apple", href: "#" },
    { id: "linux", name: "Linux", storeName: "Snap Store", storeIconType: "snap", href: "#" },
  ],
};
export const DownloadSection = () => {
  return (
    <section className="relative px-6 max-w-7xl mx-auto grid-background overflow-hidden">
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
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
