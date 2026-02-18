'use client';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedButton from './AnimatedButton';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type NavigationProps = { className?: string };

export default function Navigation({ className }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setDropdownOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.avatar-dropdown')) {
        setDropdownOpen(false);
      }
    };

    if (open || dropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open, dropdownOpen]);

  return (
    <>
      {/* Navbar */}
      <nav
        className={cn(
          'mx-auto flex items-center justify-between shadow-sm border-b border-black/10 bg-bg-light backdrop-blur-sm px-4 py-3',
          className,
        )}
      >
        <div className="cursor-pointer">
          <a href="/" className="flex gap-2 items-center">
            <Image src="/logo.png" width={30} height={30} alt="logo" />
            <span className="text-black font-bold">Qluely</span>
          </a>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-10 text-black text-sm">
          <a href="/#features" className="hover:text-black/70 cursor-pointer">
            Features
          </a>

          <a href="/#pricing" className="hover:text-black/70 cursor-pointer">
            Pricing
          </a>

          <a href="/downloads" className="hover:text-black/70 cursor-pointer">
            Downloads
          </a>

          <a href="/about" className="hover:text-black/70 cursor-pointer">
            About
          </a>

          <a href="/privacy" className="hover:text-black/70 cursor-pointer">
            Privacy Policy
          </a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-2 items-center">
          {isLoading ? (
            <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
          ) : user ? (
            <div className="relative avatar-dropdown">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">{user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.accountType || 'FREE'} Account
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/downloads"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Download App
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <AnimatedButton className="rounded-full py-1 bg-accent" variant="ripple">
                  Login
                </AnimatedButton>
              </Link>
              <Link href="/register">
                <AnimatedButton className="shadow-2xl py-1 rounded-sm" variant="shimmer">
                  Register
                </AnimatedButton>
              </Link>
            </>
          )}
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

      <div className={cn('fixed inset-0 z-50 transition', open ? 'visible' : 'invisible')}>
        <div
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setOpen(false)}
        />

        <aside
          className={cn(
            'absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6 transition-transform',
            open ? 'translate-x-0' : 'translate-x-full',
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
            <a
              href="/#features"
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Features
            </a>

            <a
              href="/#pricing"
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Pricing
            </a>

            <a
              href="/downloads"
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Downloads
            </a>

            <a
              href="/about"
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              About
            </a>

            <a
              href="/privacy"
              className="hover:text-black/70 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Privacy Policy
            </a>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="hover:text-black/70 cursor-pointer text-red-600 hover:text-red-500 text-left"
              >
                Logout
              </button>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user?.email || 'Loading...'}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.accountType || 'FREE'} Account
                    </p>
                  </div>
                </div>
                <AnimatedButton className="py-2 rounded-sm" variant="shimmer">
                  <Link href="/downloads" onClick={() => setOpen(false)}>
                    Download
                  </Link>
                </AnimatedButton>
                <AnimatedButton
                  className="py-2 rounded-sm bg-gray-100 text-gray-700"
                  variant="ripple"
                >
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                </AnimatedButton>
              </>
            ) : (
              <>
                <AnimatedButton className="rounded-full py-2 bg-accent" variant="ripple">
                  <Link href="/login">Login</Link>
                </AnimatedButton>
                <AnimatedButton className="py-2 rounded-sm" variant="shimmer">
                  <Link href="/register">Register</Link>
                </AnimatedButton>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
