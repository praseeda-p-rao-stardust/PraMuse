"use client";

import { useStore } from "@/store/useStore";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Repeat, Bell, Moon, Sun, LogOut, UserCircle, LayoutDashboard, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) { const d = await res.json(); setNotifications(d.total || 0); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full flex justify-between items-center py-4 px-6 md:px-10 z-50 sticky top-0 transition-all duration-300 ${
        scrolled ? 'glass shadow-md border-b border-[var(--border)]' : 'bg-transparent'
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Repeat className="text-[var(--primary-fg)] w-4 h-4" />
        </div>
        <span className="font-heading font-bold text-[1.2rem] text-[var(--fg)] tracking-tight">PraMuse</span>
      </Link>

      {/* Center */}
      <div className="hidden md:flex items-center gap-1">
        {[{ href: '/explore', label: 'Explore', icon: Compass },
          ...(isAuthenticated ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : [])
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass)] transition-all">
            <Icon className="w-3.5 h-3.5" />{label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {mounted && (
          <button onClick={toggleTheme} className="p-2 rounded-xl text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass)] transition-all" title="Toggle theme">
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </button>
        )}

        {mounted && isAuthenticated && user ? (
          <>
            <button onClick={() => router.push('/inbox')} className="relative p-2 rounded-xl text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass)] transition-all">
              <Bell className="w-4 h-4" />
              <AnimatePresence>
                {notifications > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {notifications > 9 ? '9+' : notifications}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-[var(--border-strong)] hover:bg-[var(--glass-strong)] transition-all">
              {user.avatar ? (
                <Image src={user.avatar} alt="" width={24} height={24} className="rounded-full w-6 h-6 object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-fg)] text-xs font-bold">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold text-[var(--fg)] hidden md:block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
            </Link>

            <button onClick={() => { logout(); router.push('/'); }} className="p-2 rounded-xl text-[var(--fg-subtle)] hover:text-red-500 hover:bg-red-50/50 transition-all" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : mounted ? (
          <div className="flex items-center gap-2">
            <Link href="/auth" className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hidden md:block px-3 py-2 transition-colors">Log in</Link>
            <Link href="/auth" className="btn-primary text-sm">
              Start Free →
            </Link>
          </div>
        ) : null}
      </div>
    </motion.nav>
  );
}
