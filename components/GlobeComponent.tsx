'use client';
import { Globe } from '@/components/ui/globe';

export default function GlobeComponent() {
  return (
    <div className="bg-background relative flex size-full  items-center justify-center overflow-hidden rounded-lg border px-40 pt-8 pb-40 md:pb-60 h-screen w-full">
      <Globe className="top-0 w-1/2" />
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  );
}
