"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowRight, Zap, MessageSquare, Star, Shield, Users, TrendingUp, Check, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const FLOATING_SKILLS = [
  { title: "UI/UX Design", seeking: "Python", user: "Aarav S.", score: 4.9, delay: 0 },
  { title: "Guitar Lessons", seeking: "French", user: "Priya M.", score: 5.0, delay: 0.4 },
  { title: "Data Science", seeking: "Yoga", user: "Rohan K.", score: 4.8, delay: 0.8 },
  { title: "Copywriting", seeking: "Music", user: "Neha T.", score: 4.7, delay: 0.2 },
];

const STEPS = [
  { n: "01", title: "Post your skill", desc: "Share what you're great at — design, coding, music, language, fitness, anything." },
  { n: "02", title: "AI finds your match", desc: "Our Llama-3 AI scans the marketplace and picks the single best swap partner for you." },
  { n: "03", title: "Learn & grow", desc: "Chat, schedule, exchange. Complete the swap and build your Trust Score." },
];

const FEATURES = [
  { icon: Zap, title: "AI Magic Match", desc: "Groq Llama-3 analyzes the entire marketplace to find your perfect skill-swap partner in seconds.", badge: "Powered by Groq" },
  { icon: MessageSquare, title: "Live Chat", desc: "Real-time messaging built right in. No WhatsApp, no third-party apps. Just you and your swap partner.", badge: "Real-time" },
  { icon: Shield, title: "Trust Economy", desc: "Every completed swap earns a verified review. Your Trust Score is your reputation on the platform.", badge: "Verified" },
  { icon: Users, title: "Global Marketplace", desc: "Connect with learners and teachers from any country. Skills have no borders.", badge: "Worldwide" },
  { icon: Star, title: "Zero Cost", desc: "No subscriptions, no tokens, no credits. Your expertise is the only currency that matters.", badge: "Free forever" },
  { icon: TrendingUp, title: "Real Growth", desc: "Track your learning journey, completed swaps, and how your Trust Score grows over time.", badge: "Analytics" },
];

const TESTIMONIALS = [
  { name: "Aarav Singh", role: "UX Designer → Python learner", text: "I traded 10 hours of Figma mentoring for Python basics. Saved ₹15,000 and made a friend. PraMuse is insane.", score: 5, avatar: "AS" },
  { name: "Priya Mehta", role: "French Teacher → Guitar learner", text: "The AI matched me with someone in under 30 seconds. We've been swapping for 3 months. This is the future.", score: 5, avatar: "PM" },
  { name: "Rohan Kumar", role: "Data Scientist → Yoga student", text: "My Trust Score is 4.9. Companies literally message me because of it. It's like a LinkedIn for skill traders.", score: 5, avatar: "RK" },
];

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
  const { isAuthenticated } = useStore();
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-x-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-30 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />

      <Navbar />

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-8 pb-24 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full bg-[var(--primary)] opacity-[0.05] blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[var(--glass-border)] mb-8 text-sm font-medium text-[var(--fg-muted)]">
            <div className="relative flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>AI-powered skill marketplace · Live on Vercel</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[1.05] tracking-tight text-[var(--fg)] mb-6">
            Your Talent<br />
            <span className="gradient-text">is Currency.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[clamp(1rem,2.5vw,1.3rem)] text-[var(--fg-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Trade UI Design for Python. Exchange Guitar lessons for French. Our Llama-3 AI finds your perfect partner. Zero money. Pure growth.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href={mounted && isAuthenticated ? "/dashboard" : "/auth"}
              className="btn-primary text-base px-8 py-4 rounded-2xl group glow-primary">
              Start Trading Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/explore"
              className="flex items-center gap-2 text-base font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] px-6 py-4 rounded-2xl hover:bg-[var(--glass)] border border-transparent hover:border-[var(--border)] transition-all">
              Explore Skills <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Floating skill cards */}
          <div className="relative h-48 md:h-56 w-full max-w-4xl mx-auto">
            {FLOATING_SKILLS.map((skill, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -3 : 3 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -2 : 2 }}
                transition={{ duration: 0.8, delay: 0.4 + skill.delay, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  left: `${[5, 28, 52, 72][i]}%`,
                  top: `${[10, 40, 5, 35][i]}%`,
                  animation: `float ${[6, 8, 7, 9][i]}s ease-in-out ${skill.delay}s infinite`,
                }}
                className="glass-strong rounded-2xl p-3.5 shadow-lg border border-[var(--glass-border)] w-44 md:w-48 cursor-default select-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full">OFFERING</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-[var(--accent)] text-[var(--accent)]" />
                    <span className="text-xs font-bold text-[var(--fg)]">{skill.score}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-[var(--fg)] mb-1">{skill.title}</p>
                <p className="text-xs text-[var(--fg-muted)]">Wants: {skill.seeking}</p>
                <p className="text-xs text-[var(--fg-subtle)] mt-1.5">by {skill.user}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <section className="section-sm border-y border-[var(--border)]">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 2400, suffix: "+", label: "Skills Listed" },
              { value: 1800, suffix: "+", label: "Swaps Completed" },
              { value: 4, suffix: ".9★", label: "Avg Trust Score" },
              { value: 100, suffix: "%", label: "Free Forever" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl md:text-5xl font-bold font-heading text-[var(--fg)] mb-1">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-[var(--fg-muted)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-3">How it works</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="font-heading text-4xl md:text-5xl font-bold text-[var(--fg)] leading-tight">
              Three steps to your<br /><span className="gradient-text">first skill swap</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="card relative text-center group">
                <div className="w-14 h-14 rounded-2xl glass border border-[var(--border-strong)] flex items-center justify-center mx-auto mb-6 group-hover:border-[var(--accent)] transition-colors">
                  <span className="text-xl font-bold gradient-text">{step.n}</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--fg)] mb-3 font-heading">{step.title}</h3>
                <p className="text-[var(--fg-muted)] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SPOTLIGHT ─── */}
      <section className="section">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden border border-[var(--border-strong)] bg-[var(--primary)] p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="absolute top-[-30%] left-[20%] w-[400px] h-[400px] rounded-full bg-[var(--accent)] opacity-10 blur-[80px]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 mb-6">
                <Zap className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-bold text-[var(--accent)]">Powered by Groq · Llama-3-8b</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#FFF1B5] mb-4 leading-tight">
                AI that actually understands<br />what you want to learn
              </h2>
              <p className="text-[#FFF1B5]/70 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                One tap. Our Llama-3 AI scans every skill on the marketplace and returns your single best match with a personalised explanation — in under 2 seconds.
              </p>
              <Link href={mounted && isAuthenticated ? "/dashboard" : "/auth"}
                className="inline-flex items-center gap-2 bg-[#FFF1B5] text-[#43302E] px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Try Magic Match <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-sm font-bold uppercase tracking-widest text-[var(--accent)] mb-3">Everything you need</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="font-heading text-4xl md:text-5xl font-bold text-[var(--fg)]">
              Built for real<br /><span className="gradient-text">skill exchange</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className="card group cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--accent-subtle)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-[var(--fg)]" />
                  </div>
                  <span className="text-xs font-bold text-[var(--fg-subtle)] bg-[var(--glass)] px-2.5 py-1 rounded-full border border-[var(--border)]">{f.badge}</span>
                </div>
                <h3 className="font-bold text-[var(--fg)] text-lg mb-2 font-heading">{f.title}</h3>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-14">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="font-heading text-4xl md:text-5xl font-bold text-[var(--fg)]">
              Real people. <span className="gradient-text">Real swaps.</span>
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="card flex flex-col">
                <div className="flex mb-4 gap-0.5">
                  {[...Array(t.score)].map((_, s) => <Star key={s} className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" />)}
                </div>
                <p className="text-[var(--fg)] text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-fg)] text-xs font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-[var(--fg)]">{t.name}</p>
                    <p className="text-xs text-[var(--fg-muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section">
        <div className="container-sm text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="card p-12 md:p-16 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.06] rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-[var(--fg)] mb-4">
                Ready to trade<br /><span className="gradient-text">your first skill?</span>
              </h2>
              <p className="text-[var(--fg-muted)] mb-8 text-lg">Join free. No credit card. No commitment.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth" className="btn-primary text-base px-8 py-4 rounded-2xl">
                  Create Free Account →
                </Link>
                <Link href="/explore" className="btn-ghost text-base px-8 py-4 rounded-2xl">
                  Browse Skills
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[var(--fg-muted)]">
                {["Free forever", "No credit card", "2-min setup"].map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-green-500" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[var(--border)] py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-[var(--primary-fg)] text-xs font-bold">P</span>
            </div>
            <span className="font-bold text-[var(--fg)] text-sm">PraMuse</span>
          </div>
          <p className="text-sm text-[var(--fg-muted)]">© 2026 PraMuse · The Skill Barter Revolution</p>
          <div className="flex items-center gap-5 text-sm text-[var(--fg-muted)]">
            <Link href="/explore" className="hover:text-[var(--fg)] transition-colors">Explore</Link>
            <Link href="/auth" className="hover:text-[var(--fg)] transition-colors">Sign Up</Link>
            <Link href="/dashboard" className="hover:text-[var(--fg)] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
