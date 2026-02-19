'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaitlistCounterProps {
  className?: string;
}

export function WaitlistCounter({ className }: WaitlistCounterProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1/waitlist/count`);
        const data = await response.json();
        
        if (data.success) {
          setCount(data.data.count);
        }
      } catch (error) {
        console.error('Failed to fetch waitlist count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || count === null) {
    return (
      <div className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full', className)}>
        <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse" />
        <span className="text-white/60 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10', className)}
    >
      <div className="relative">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </div>
      <span className="text-white/90 text-sm font-medium">
        {count.toLocaleString()} people joined
      </span>
    </motion.div>
  );
}
