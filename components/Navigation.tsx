"use client";
import { cn } from "@/lib/utils";
import logo from "../assets/logo_transparent.png";
import Image from "next/image";
import { ShimmerButton } from "./ui/shimmer-button";
import { RippleButton } from "./ui/ripple-button";
import AnimatedButton from "./AnimatedButton";
type NavigationProps = {
  className?: string;
};
export default function Navigation({ className }: NavigationProps) {
  return (
    <nav
      className={cn(
        "max-w-5xl mx-auto flex items-center justify-between rounded-full shadow-sm border border-black/10 bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex gap-2 justify-center items-center cursor-pointer">
        <Image src={logo} width={30} height={30} alt="logo" />
        <span className="text-black font-bold">Qluely.in</span>
      </div>
      <div className="flex gap-10 text-black text-sm">
        <span className="hover:text-black/70 cursor-pointer">Features</span>
        <span className="hover:text-black/70 cursor-pointer">Pricing</span>
        <span className="hover:text-black/70 cursor-pointer">Downloads</span>
        <span className="hover:text-black/70 cursor-pointer">About</span>
        <span className="hover:text-black/70 cursor-pointer">FAQ</span>
      </div>
      <div className="flex gap-2">
        <AnimatedButton className="rounded-full py-1" variant="ripple">
          Login
        </AnimatedButton>
        <AnimatedButton
          className="shadow-2xl py-1 rounded-sm"
          variant="shimmer"
        >
          Register
        </AnimatedButton>
      </div>
    </nav>
  );
}
