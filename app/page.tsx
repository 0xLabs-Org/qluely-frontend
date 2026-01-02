"use client";
import { MessageSquare, FileText, Eye, Mail, ArrowUpRight } from "lucide-react";
import "./globals.css";
import { motion } from "motion/react";
import { useOS } from "@/hooks/useOs";
import Navigation from "@/components/Navigation";
import logo from "../assets/logo_transparent.png";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import FeatureSection from "@/components/Features";
import Image from "next/image";
import PricingComponent from "@/components/PricingComponent";

const features = [
  {
    title: "Live Notes",
    description: "Auto-transcribes and highlights key points in real-time.",
    icon: FileText,
    color: "#10B981",
  },
  {
    title: "Instant Answers",
    description:
      "Ask anything, get context-aware responses without switching tabs.",
    icon: MessageSquare,
    color: "#F59E0B",
  },
  {
    title: "Undetectable Overlay",
    description: "Movable UI stays hidden from screen shares and participants.",
    icon: Eye,
    color: "#7C3AED",
  },
  {
    title: "Smart Follow-Ups",
    description: "Generate emails and action items post-meeting.",
    icon: Mail,
    color: "#EC4899",
  },
];

export const ApplicationURL: Record<"macOS" | "Linux" | "Windows", string> = {
  macOS:
    "https://github.com/0xLabs-Org/Qluely/releases/download/v1.0.0/Qluely.1.0.2.exe",
  Linux:
    "https://github.com/0xLabs-Org/Qluely/releases/download/v1.0.0/Qluely.1.0.2.exe",
  Windows:
    "https://github.com/0xLabs-Org/Qluely/releases/download/v1.0.0/Qluely.1.0.2.exe",
};

export default function QluelyLanding() {
  const os = useOS();

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-bg-light">
      {/* Navigation */}
      {/* <div className="w-full px-4 sm:px-6 pt-6 z-20"> */}
      <Navigation className="px-6 py-2 z-1" />
      {/* </div> */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
        <div className="absolute -top-1/3 -left-1/4 md:-top-1/2 md:-left-1/3 w-1/2 h-full border-2 border-dotted border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute -top-1/2 -right-1/3 md:-top-1/2 md:-right-1/3 w-1/2 h-full border-2 border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute top-2/3 -left-1/4 md:top-1/3 md:-left-1/4 w-1/2 h-1/2 border-2 border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute top-3/5 -right-1/4 md:top-1/3 md:-right-1/4 w-1/2 h-1/2 border-2 border-dotted border-[#2b8ecc]/10 rounded-2xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90svh] md:min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 ">
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-2 text-center max-w-4xl mx-auto">
          <span className="pointer-events-none bg-linear-to-b from-primary to-primary/70 bg-clip-text text-5xl sm:text-5xl md:text-7xl leading-tight font-semibold text-transparent">
            Undetectable AI
          </span>

          <span className="pointer-events-none bg-linear-to-tl from-[#2b8ecc] to-[#2b8ecc]/50 bg-clip-text text-5xl sm:text-5xl md:text-7xl leading-tight font-semibold text-transparent">
            for Meetings
          </span>

          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-black/60 font-medium text-sm sm:text-base text-center">
              Qluely is your private, real-time AI meeting co-pilot.
            </span>
            <span className="text-black/60 font-medium text-sm sm:text-base text-center">
              Just accurate answers, quiet intelligence in the background.
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4 mt-10"
          >
            <button className="px-6 py-3 bg-white border border-gray-200 text-[#1A1F36] rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Demo
            </button>
            <button className="px-6 py-3 bg-[#1A1F36] text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200/50 flex gap-1">
              Try for Free
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>

          {/* <Button className="flex items-center gap-2 mt-6 px-6 py-3 text-base sm:text-lg">
            Try for Free
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button> */}

          <HeroVideoDialog
            className="block dark:hidden mt-8 w-full max-w-[320px] sm:max-w-sm md:max-w-[640px] lg:max-w-[800px] xl:max-w-[900px] aspect-video"
            animationStyle="from-center"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
            thumbnailAlt="Hero Video"
          />
        </div>
      </section>
      {/* feature */}
      <FeatureSection />

      {/* --- Pricing Section --- */}
      <PricingComponent />

      {/* CTA  */}
      <div className="relative w-[80vw] h-40  md:h-70 md:w-7xl mx-auto bg-[#575dff] rounded-xl  mb-20 flex  justify-center items-center gap-5 overflow-hidden">
        <div className="flex flex-col gap-5 justify-center items-center">
          <span className="text-xl md:text-4xl text-amber-50">
            Interview smarter, not harder.
          </span>
          <span className="text-xl md:text-4xl text-amber-50">
            {" "}
            Get hired faster.
          </span>
        </div>
        <div className="absolute bottom-0 right-0 hidden md:block">
          <Image src="/model.png" alt="model" width={400} height={300} />
        </div>
        <div className="absolute bottom-0 -right-10 block sm:hidden overflow-hidden">
          <Image src="/model.png" alt="model" width={150} height={100} />
        </div>
      </div>

      <footer className="py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-200 bg-white text-black relative h-[50svh] md:h-[30svh]">
        <div className="max-w-5xl mx-auto flex flex-col justify-around items-center gap-8">
          <div className="w-full flex flex-col md:flex-row justify-between mx-auto">
            <div className="flex gap-2 items-center cursor-pointer">
              <Image src={logo} width={50} height={50} alt="logo" />
              <span className="text-black font-bold text-4xl">Qluely</span>
            </div>
            <div className="flex flex-col gap-2 ">
              <span className="text-sm text-black/40 font-medium">Social</span>
              <span className="text-black/60 hover:text-black/90 cursor-pointer">
                Instagram
              </span>
              <span className="text-black/60 hover:text-black/90 cursor-pointer">
                Twitter
              </span>
            </div>
          </div>
          <span className="text-black/40 absolute bottom-5">
            &copy; 2026 Qluely. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
