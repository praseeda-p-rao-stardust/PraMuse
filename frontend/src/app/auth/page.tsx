"use client";

import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Repeat, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { toast.error("Please fill in all fields"); return; }
    setIsLoading(true);
    try {
      localStorage.setItem("pramuse-pending-name", name.trim());
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: name.trim() },
        },
      });
      if (error) throw error;
      setMagicSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FFF1B5] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#43302E]/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-[#43302E] flex items-center justify-center shadow-lg">
            <Repeat className="text-[#FFF1B5] w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-3xl text-[#43302E] tracking-tight">PraMuse</span>
        </Link>

        <div className="glass p-8 rounded-[2rem] border border-white/50 shadow-2xl">
          {magicSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-[#43302E] mb-2">Check your inbox!</h2>
              <p className="text-[#43302E]/60 text-sm leading-relaxed">
                We sent a magic login link to <span className="font-bold text-[#43302E]">{email}</span>.<br />
                Click it to sign in — no password needed.
              </p>
              <button onClick={() => setMagicSent(false)} className="mt-6 text-sm text-[#43302E]/60 hover:text-[#43302E] underline">
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-heading font-bold text-[#43302E] mb-1">Welcome to PraMuse</h1>
              <p className="text-[#43302E]/60 mb-6 text-sm">Sign in securely via Email Magic Link.</p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#43302E] mb-2 uppercase tracking-wider">Your Name</label>
                  <input type="text" placeholder="Praseeda P Rao" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl px-4 py-3.5 text-[#43302E] outline-none placeholder:text-[#43302E]/40 text-sm" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[#43302E] mb-2 uppercase tracking-wider">Email Address</label>
                  <input type="email" placeholder="praseeda@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl px-4 py-3.5 text-[#43302E] outline-none placeholder:text-[#43302E]/40 text-sm" />
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#43302E] text-[#FFF1B5] py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#43302E]/90 transition-all shadow-lg disabled:opacity-60 mt-2">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send Magic Link <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <p className="text-center text-xs text-[#43302E]/40 mt-6 leading-relaxed">
                No passwords to remember. Simply click the unique link sent to your inbox to authenticate.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
