"use client";
import { MessageSquare, FileText, Eye, Mail, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { useOS } from "@/hooks/useOs";
import Navigation from "@/components/Navigation";
import { AnimatedGradientText } from "@/components/AnimatedTextButton";
import { Button } from "@/components/ui/button";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

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
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-1/2 -left-1/3 w-1/2 h-full border-2 border-dotted border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute top-1/3 -right-1/4 w-1/2 h-1/2 border-2 border-dotted border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute top-1/3 -left-1/4 w-1/2 h-1/2 border-2 border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute -top-1/2 -right-1/3 w-1/2 h-full border-2 border-[#2b8ecc]/10 rounded-2xl" />
      </div>
      <section className="relative  min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6  py-20">
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <span className="pointer-events-none bg-linear-to-b from-primary to-primary/70 bg-clip-text text-6xl sm:text-7xl leading-none font-semibold text-transparent">
            Undetectable AI
          </span>

          <span className="pointer-events-none bg-linear-to-tl from-[#2b8ecc] to-[#2b8ecc]/50 bg-clip-text text-6xl sm:text-7xl leading-none font-semibold text-transparent">
            for Meetings
          </span>

          <div className="flex flex-col items-center gap-1">
            <span className="text-black/60 font-medium">
              Qluely is your private, real-time AI meeting co-pilot.
            </span>
            <span className="text-black/60 font-medium">
              Just accurate answers, quiet intelligence in the background.
            </span>
          </div>

          <Button className="flex gap-1 mt-4">
            Try for Free
            <ArrowUpRight />
          </Button>

          <HeroVideoDialog
            className="block dark:hidden mt-6 h-150 w-250"
            animationStyle="from-center"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
            thumbnailAlt="Hero Video"
          />
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 ">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-transparent bg-clip-text bg-linear-to-r from-[#7C3AED] to-[#EC4899] text-center text-3xl sm:text-4xl md:text-5xl mb-10 sm:mb-16 px-2"
          >
            Stay Ahead Without Breaking Focus
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className=" border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)] hover:border-[#7C3AED]/30 transition-all"
                >
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6"
                    style={{
                      backgroundColor: `${feature.color}15`,
                      border: `2px solid ${feature.color}`,
                    }}
                  >
                    <Icon
                      size={28}
                      className="sm:hidden"
                      style={{ color: feature.color }}
                    />
                    <Icon
                      size={32}
                      className="hidden sm:block"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-[#1A1F36] text-xl sm:text-2xl mb-3 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-[#64748B] text-base sm:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Pricing Section --- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 ">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-3xl sm:text-4xl md:text-5xl mb-10 sm:mb-16 text-[#1A1F36] px-2"
          >
            Choose Your Plan
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1F36] mb-4">
                Free
              </h3>
              <p className="text-[#64748B] mb-6">
                Basic features for casual users
              </p>
              <div className="text-4xl sm:text-5xl font-bold text-[#7C3AED] mb-6">
                ₹0
              </div>
              <ul className="text-left text-[#64748B] mb-8 space-y-2">
                <li>• Live notes for 1 meeting/month</li>
                <li>• Basic summaries</li>
                <li>• Email follow-ups</li>
              </ul>
              <button
                aria-label="Download free Qluely"
                onClick={() => {
                  const url =
                    ApplicationURL[os as "macOS" | "Linux" | "Windows"];
                  window.open(url);
                }}
                className="w-full bg-linear-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-3 rounded-full text-lg font-medium hover:shadow-[0_0_25px_rgba(124,58,237,0.35)] transition-all transform hover:scale-105"
              >
                Download Free
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border-2 border-[#7C3AED] rounded-2xl p-6 sm:p-8 text-center relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#7C3AED] text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1F36] mb-4">
                Pro
              </h3>
              <p className="text-[#64748B] mb-6">
                Unlimited AI-powered meetings
              </p>
              <div className="text-4xl sm:text-5xl font-bold text-[#7C3AED] mb-2">
                ₹749
              </div>
              <p className="text-[#64748B] mb-6">per month (INR)</p>
              <ul className="text-left text-[#64748B] mb-8 space-y-2">
                <li>• Unlimited meetings</li>
                <li>• Real-time answers</li>
                <li>• Undetectable overlay</li>
                <li>• Smart follow-ups</li>
                <li>• CRM integrations</li>
              </ul>
              <button
                onClick={async () => {
                  window.location.href = "/signin";
                }}
                className="w-full bg-linear-to-r from-[#7C3AED] to-[#EC4899] text-white px-6 py-3 rounded-full text-lg font-medium hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all transform hover:scale-105"
              >
                Upgrade to Pro
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-200 bg-white text-black relative">
        <div className="max-w-5xl mx-auto flex flex-col justify-around items-center gap-8">
          <div className="w-full flex justify-between mx-auto">
            <span className="cursor-pointer text-4xl font-medium">Qluely</span>
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
