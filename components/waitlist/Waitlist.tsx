'use client';
import { motion } from 'motion/react';
import { WaitlistForm } from './WaitlistForm';

export function WaitList() {
    return <section
        className="relative w-full py-20 md:py-32 overflow-hidden"
        id="waitlist"
    >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-950 to-pink-950" />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                    Be the First to Experience
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        AI-Powered Meetings
                    </span>
                </h2>

                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                    Join the waitlist for early access. Get exclusive features and be part of the future of meeting intelligence.
                </p>

                {/* Waitlist Form */}
                <div className="pt-8">
                    <WaitlistForm />
                </div>
            </motion.div>
        </div>
    </section>
}