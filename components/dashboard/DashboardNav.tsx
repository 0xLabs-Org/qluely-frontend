'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogOut, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardNav() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Element;
            if (!target.closest('.avatar-dropdown')) {
                setDropdownOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDropdownOpen(false);
        };

        if (dropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [dropdownOpen]);

    const displayName = user?.email?.split('@')[0] || 'User';

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-[var(--dash-border)] bg-[var(--dash-surface)]/80 backdrop-blur-xl">
            <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-8 h-[60px]">
                {/* Logo + Product indicator */}
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2.5 group">
                        <Image src="/logo.png" width={26} height={26} alt="Qluely" />
                        <span className="text-[15px] font-semibold text-[var(--dash-text-primary)] tracking-[-0.01em]">
                            Qluely
                        </span>
                    </Link>
                    <div className="hidden sm:flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/15">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-medium text-emerald-600 tracking-wide uppercase">
                            Always On
                        </span>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/downloads"
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover)] rounded-lg transition-all duration-200"
                    >
                        <Download size={14} strokeWidth={2} />
                        <span>Get App</span>
                    </Link>

                    {/* Avatar dropdown */}
                    <div className="relative avatar-dropdown ml-1">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[var(--dash-hover)] transition-all duration-200"
                        >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-deep)] flex items-center justify-center text-white text-[12px] font-semibold">
                                {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <ChevronDown
                                size={13}
                                className={`text-[var(--dash-text-muted)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-[var(--dash-surface)] rounded-xl shadow-lg border border-[var(--dash-border)] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="px-3.5 py-2.5 border-b border-[var(--dash-border)]">
                                    <p className="text-[13px] font-medium text-[var(--dash-text-primary)]">
                                        {displayName}
                                    </p>
                                    <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text-primary)] transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/downloads"
                                        className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text-primary)] transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Download App
                                    </Link>
                                </div>

                                <div className="border-t border-[var(--dash-border)] pt-1">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[var(--dash-state-critical)] hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={13} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
