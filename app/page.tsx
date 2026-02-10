'use client';
import { ArrowUpRight } from 'lucide-react';
import './globals.css';
import { motion } from 'motion/react';
import { useOS } from '@/hooks/useOs';
import Navigation from '@/components/Navigation';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';
import FeatureSection from '@/components/Features';
import Image from 'next/image';
import PricingComponent from '@/components/PricingComponent';
import { DotPattern } from '@/components/ui/dot-pattern';
import { cn } from '@/lib/utils';
import { FAQ } from '@/components/FAQ';
import Footer from '@/components/Footer';
export const ApplicationURL: Record<'macOS' | 'Linux' | 'Windows', string> = {
  macOS: 'https://github.com/0xLabs-Org/Qluely/releases/download/v1.0.0/Qluely.1.0.2.exe',
  Linux: 'https://github.com/0xLabs-Org/Qluely/releases/download/v1.0.0/Qluely.1.0.2.exe',
  Windows: 'https://github.com/0xLabs-Org/Qluely/releases/download/v1.0.0/Qluely.1.0.2.exe',
};

export default function QluelyLanding() {
  const os = useOS();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Navigation */}
      {/* <div className="w-full px-4 sm:px-6 pt-6 z-20"> */}
      <Navigation className="px-6 py-2 relative z-50" />
      {/* </div> */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden md:block">
        <div className="absolute -top-1/3 -left-1/4 md:-top-1/2 md:-left-1/3 w-1/2 h-full border-2 border-dotted border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute -top-1/2 -right-1/3 md:-top-1/2 md:-right-1/3 w-1/2 h-full border-2 border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute top-2/3 -left-1/4 md:top-1/3 md:-left-1/4 w-1/2 h-1/2 border-2 border-[#2b8ecc]/10 rounded-2xl" />
        <div className="absolute top-3/5 -right-1/4 md:top-1/3 md:-right-1/4 w-1/2 h-1/2 border-2 border-dotted border-[#2b8ecc]/10 rounded-2xl" />
      </div>

      {/* Hero Section */}
      <section
        id="hero-section"
        className="relative min-h-[90svh] md:min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 "
      >
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
            videoSrc="https://youtube.com/embed/4NOum3zjNqg?si=RxRQp30fcU1MKPrU"
            thumbnailSrc={`${process.env.NEXT_PUBLIC_AWS_S3}/assets/thumbnail.png`}
            thumbnailAlt="Hero Video"
          />
        </div>
      </section>
      {/* feature */}
      <FeatureSection id="features" />

      {/* --- Pricing Section --- */}
      <PricingComponent id="pricing" />

      {/* FAQ Section */}
      <FAQ className="min-h-svh" />

      {/* CTA  */}
      <section
        className="relative w-[80vw] h-40  md:h-70 md:w-7xl mx-auto bg-linear-to-bl from-[#575dff] to-[#a8abdb] rounded-xl  mb-20 flex  justify-center items-center gap-5 overflow-hidden"
        id="cta"
      >
        <DotPattern
          width={20}
          className={cn(
            '[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]',
            'absolute top-0 left-0 z-0',
          )}
        />
        <div className="flex flex-col gap-5 justify-center items-center relative z-10">
          <span className="text-xl md:text-4xl text-amber-50">Interview smarter, not harder.</span>
          <span className="text-xl md:text-4xl text-amber-50">Get hired faster.</span>
        </div>
        <div className="absolute -bottom-5 right-0 hidden md:block">
          <Image src="/model.png" alt="model" width={450} height={300} />
        </div>
        <div className="absolute -bottom-10 -right-10 block sm:hidden overflow-hidden">
          <Image src="/model.png" alt="model" width={150} height={100} />
        </div>
      </section>

      {/* footer */}
      <Footer />
    </div>
  );
}
