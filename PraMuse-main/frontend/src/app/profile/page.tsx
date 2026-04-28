"use client";

import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Save, Loader2, Repeat, User as UserIcon, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: "", avatar: "" });
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.push('/auth'); return; }
  }, [isAuthenticated, router]);

  // Sync form when user loads from store
  useEffect(() => {
    if (user) {
      setForm({ name: user.name, avatar: user.avatar || "" });
      setPreviewError(false);
    }
  }, [user?.id]); // Only re-sync when the user ID changes (not on every update)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name cannot be empty"); return; }
    setIsSaving(true);
    try {
      await updateProfile({ name: form.name.trim(), avatar: form.avatar.trim() });
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !user) return (
    <div className="min-h-screen bg-[#FFF1B5] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#43302E]/20 border-t-[#43302E] rounded-full animate-spin" />
    </div>
  );

  // Live avatar preview (uses the current input value, not saved value)
  const showAvatar = form.avatar && !previewError;

  return (
    <div className="min-h-screen bg-[#FFF1B5] relative pb-20">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <nav className="w-full flex justify-between items-center py-6 px-8 md:px-16 z-10 glass border-b border-[#43302E]/10 sticky top-0 mb-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#43302E] flex items-center justify-center">
            <Repeat className="text-[#FFF1B5] w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-2xl text-[#43302E] tracking-tight">PraMuse</span>
        </Link>
        <button onClick={() => router.push("/dashboard")} className="font-medium text-[#43302E] hover:text-[#43302E]/70 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
      </nav>

      <main className="max-w-xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-heading font-bold text-[#43302E] mb-2">Edit Profile</h1>
          <p className="text-[#43302E]/60 mb-8 text-sm">Changes are saved to your account across all devices.</p>

          {/* Live Avatar Preview */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.focus()}>
              {showAvatar ? (
                <Image
                  src={form.avatar}
                  alt="Avatar"
                  width={110}
                  height={110}
                  className="rounded-full border-4 border-white shadow-xl object-cover w-[110px] h-[110px]"
                  onError={() => setPreviewError(true)}
                  onLoad={() => setPreviewError(false)}
                />
              ) : (
                <div className="w-[110px] h-[110px] rounded-full bg-[#43302E] flex items-center justify-center text-[#FFF1B5] text-4xl font-bold shadow-xl border-4 border-white">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-xs text-[#43302E]/50 mt-3">Live preview · paste a URL below to change</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="text-xs font-bold text-[#43302E]">Trust Score: {user.trust_score?.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#43302E]/50" />
                <span className="text-xs text-[#43302E]/50">{user.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5 glass p-8 rounded-[2rem] border border-white/40 shadow-xl">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-[#43302E] mb-2">Display Name</label>
              <input
                id="name-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                placeholder="Your full name"
                className="w-full bg-white/60 border border-white focus:border-[#43302E]/40 focus:ring-2 focus:ring-[#43302E]/10 rounded-2xl px-4 py-3 text-[#43302E] outline-none transition-all"
              />
            </div>

            {/* Email - read only */}
            <div>
              <label className="block text-sm font-bold text-[#43302E] mb-2">Email <span className="text-[#43302E]/40 font-normal">(read-only)</span></label>
              <input
                value={user.email}
                readOnly
                className="w-full bg-white/20 border border-white/40 rounded-2xl px-4 py-3 text-[#43302E]/50 outline-none cursor-not-allowed"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-bold text-[#43302E] mb-2">Profile Photo URL</label>
              <input
                id="avatar-input"
                value={form.avatar}
                onChange={e => { setPreviewError(false); setForm(f => ({ ...f, avatar: e.target.value })); }}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-white/60 border border-white focus:border-[#43302E]/40 focus:ring-2 focus:ring-[#43302E]/10 rounded-2xl px-4 py-3 text-[#43302E] outline-none transition-all"
              />
              <p className="text-xs text-[#43302E]/40 mt-1.5">
                Tip: Right-click any photo online → &quot;Copy Image Address&quot; and paste it here.
              </p>
              {previewError && form.avatar && (
                <p className="text-xs text-red-500 mt-1">⚠️ Could not load this image URL. Try a different one.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#43302E] text-[#FFF1B5] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#43302E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
            >
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving to database...</>
                : <><Save className="w-4 h-4" /> Save Changes</>
              }
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
