"use client";
import React, { useState } from "react";
import { MessageSquare, FileText, Eye, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useOS } from "@/hooks/useOs";
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
const testimonials = [
  {
    quote:
      "Qluely has transformed how I handle back-to-back meetings. I never miss a detail, and no one knows I'm using it.",
    author: "Sarah Chen",
    role: "Product Manager at TechCorp",
  },
  {
    quote:
      "The real-time answers feature is a game-changer. It's like having a superpower that's completely invisible.",
    author: "Michael Rodriguez",
    role: "Sales Director at GrowthLabs",
  },
  {
    quote:
      "Finally, an AI meeting assistant that actually stays hidden. The undetectable overlay is worth every penny.",
    author: "Emily Watson",
    role: "Consultant at Strategy Partners",
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
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const os = useOS();

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 3000);
  };
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00D4FF] selection:text-black overflow-x-hidden">
      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="text-[#7C3AED] tracking-wider text-lg sm:text-xl">
            QLUELY
          </div>
          <button
            className="bg-linear-to-r from-[#7C3AED] to-[#EC4899] text-white px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all transform hover:scale-105"
            onClick={() => {
              const url = ApplicationURL[os as "macOS" | "Linux" | "Windows"];
              window.open(url);
            }}
          >
            Download Free
          </button>
        </div>
      </nav>

      <section className="min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-20 pb-12 sm:pb-0 bg-linear-to-b from-white via-[#F8F9FA] to-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-transparent bg-clip-text bg-linear-to-r from-[#7C3AED] via-[#EC4899] to-[#10B981] uppercase tracking-[0.05em] text-4xl sm:text-5xl md:text-7xl leading-[1.1] mb-6 sm:mb-8 px-2"
          >
            #1 undetectable AI for meetings
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#1A1F36] text-lg sm:text-2xl md:text-[32px] leading-[1.4] mb-8 sm:mb-10 max-w-4xl mx-auto px-2"
          >
            Qluely takes perfect meeting notes and gives real-time answers, all
            while completely undetectable
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center gap-4 sm:gap-6 px-4"
          >
            {os}
            <button
              className="bg-linear-to-r from-[#7C3AED] to-[#EC4899] text-white px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl rounded-full hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] transition-all transform hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none"
              onClick={() => {
                const url = ApplicationURL[os as "macOS" | "Linux" | "Windows"];
                window.open(url);
              }}
            >
              Download for {os}
            </button>

            <p className="text-[#64748B] text-base sm:text-xl">
              Works with Zoom, Teams, Meet. No traces left behind.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
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
                  className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)] hover:border-[#7C3AED]/30 transition-all"
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

      <footer className="py-12 sm:py-20 px-4 sm:px-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-transparent bg-clip-text bg-linear-to-r from-[#7C3AED] via-[#EC4899] to-[#10B981] text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 px-2">
              Get Qluely Now – Free Trial
            </h2>
            <p className="text-[#64748B] text-lg sm:text-xl mb-6 sm:mb-8 px-2">
              Join thousands of professionals staying ahead in meetings
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-[#F8F9FA] border border-gray-300 rounded-full px-5 sm:px-6 py-3 sm:py-4 text-[#1A1F36] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all text-base"
              />
              <button
                type="submit"
                className="bg-linear-to-r from-[#7C3AED] to-[#EC4899] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all transform hover:scale-105 whitespace-nowrap text-base sm:text-lg"
              >
                {submitted ? "Subscribed!" : "Start Free Trial"}
              </button>
            </form>

            {submitted && (
              <p className="text-[#10B981] mt-4 text-sm sm:text-base">
                Thank you! Check your email for the download link.
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 sm:pt-8 text-center">
            <div className="text-[#7C3AED] text-xl sm:text-2xl mb-3 sm:mb-4 tracking-wider">
              QLUELY
            </div>
            <p className="text-[#64748B] text-sm sm:text-base">
              &copy; {new Date().getFullYear()} Qluely. All rights reserved.
            </p>
            <div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 text-[#64748B] text-sm sm:text-base">
              <a href="#" className="hover:text-[#7C3AED] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[#7C3AED] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[#7C3AED] transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
