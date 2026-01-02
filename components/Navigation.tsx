"use client";
import { cn } from "@/lib/utils";
import logo from "../assets/logo_transparent.png";
import Image from "next/image";
import AnimatedButton from "./AnimatedButton";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

type NavigationProps = {
  className?: string;
};

export default function Navigation({ className }: NavigationProps) {
  const [open, setOpen] = useState(false);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      {/* Navbar */}
      <nav
        className={cn(
          "mx-auto flex items-center justify-between shadow-sm border-b border-black/10 bg-bg-light backdrop-blur-sm px-4 py-3",
          className
        )}
      >
        <div className="flex gap-2 items-center cursor-pointer">
          <Image src={logo} width={30} height={30} alt="logo" />
          <span className="text-black font-bold">Qluely</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-10 text-black text-sm">
          <span className="hover:text-black/70 cursor-pointer">Features</span>
          <span className="hover:text-black/70 cursor-pointer">Pricing</span>
          <span className="hover:text-black/70 cursor-pointer">Downloads</span>
          <span className="hover:text-black/70 cursor-pointer">About</span>
          <span className="hover:text-black/70 cursor-pointer">FAQ</span>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-2">
          <AnimatedButton
            className="rounded-full py-1 bg-accent"
            variant="ripple"
          >
            Login
          </AnimatedButton>
          <AnimatedButton
            className="shadow-2xl py-1 rounded-sm"
            variant="shimmer"
          >
            Register
          </AnimatedButton>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          open ? "visible" : "invisible"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />

        <aside
          className={cn(
            "absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6 transition-transform",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <span className="font-bold text-lg">Menu</span>
            <button
              className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-5 text-sm">
            <span
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Features
            </span>
            <span
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Pricing
            </span>
            <span
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Downloads
            </span>
            <span
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              About
            </span>
            <span
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              FAQ
            </span>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <AnimatedButton
              className="rounded-full py-2 bg-accent"
              variant="ripple"
            >
              Login
            </AnimatedButton>
            <AnimatedButton className="py-2 rounded-sm" variant="shimmer">
              Register
            </AnimatedButton>
          </div>
        </aside>
      </div>
    </>
  );
}
