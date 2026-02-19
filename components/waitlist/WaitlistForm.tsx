'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Email validation regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !isValidEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'landing_page' }),
      });

      // Handle HTTP errors first
      if (!response.ok) {
        if (response.status === 409) {
          setStatus('error');
          setMessage("You're already on the waitlist!");
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatus('error');
          setMessage(errorData.message || 'Something went wrong');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage("You're on the list! Check your email for confirmation.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to join. Please try again.');
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <form onSubmit={handleSubmit} className="relative" suppressHydrationWarning>
        <div className="relative flex items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to join the waitlist"
            disabled={status === 'loading' || status === 'success'}
            className={cn(
              'w-full px-6 py-4 pr-32 bg-white/10 backdrop-blur-sm border rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all',
              status === 'success' && 'border-green-500/50',
              status === 'error' && 'border-red-500/50'
            )}
            suppressHydrationWarning
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={cn(
              'absolute right-2 px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2',
              status === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-900 hover:bg-gray-100'
            )}
            suppressHydrationWarning
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                Joined
              </>
            ) : (
              <>
                Join
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'mt-3 text-center text-sm',
              status === 'success' ? 'text-green-400' : 'text-red-400'
            )}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
