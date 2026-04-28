"use client";

import { useStore, Skill } from "@/store/useStore";
import { motion } from "framer-motion";
import { ArrowRightLeft, Star, LayoutDashboard, Plus, X, Trash2, Repeat, UserCircle, LogOut, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<{ matchId: string; reason: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [swaps, setSwaps] = useState<any[]>([]);
  const [formData, setFormData] = useState({ offering: "", seeking: "", category: "Development", level: "Beginner", availability: "" });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.push('/auth'); return; }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    if (!user) return;
    const [skillsRes, swapsRes] = await Promise.all([
      fetch('/api/skills'),
      fetch(`/api/swaps?userId=${user.id}`)
    ]);
    const allSkillsData: Skill[] = await skillsRes.json();
    const swapsData = swapsRes.ok ? await swapsRes.json() : [];
    setAllSkills(allSkillsData);
    setSkills(allSkillsData.filter(s => s.user.id === user.id));
    setSwaps(swapsData);
  };

  const handleAiMatch = async () => {
    if (!user) return;
    setIsAiLoading(true);
    try {
      const available = allSkills.filter(s => s.user.id !== user.id);
      const res = await fetch('/api/matchmaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: user, availableSkills: available, userSkills: skills })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to find match");
      setAiMatchResult(data);
      toast.success("AI found a perfect match!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user.id, description: `${formData.offering} for ${formData.seeking}` })
      });
      if (!res.ok) throw new Error('Failed to add skill');
      toast.success("Skill published to the marketplace!");
      setIsModalOpen(false);
      setFormData({ offering: "", seeking: "", category: "Development", level: "Beginner", availability: "" });
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success("Skill removed.");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleLogout = () => { logout(); router.push('/'); };

  if (!mounted || !user) return (
    <div className="min-h-screen bg-[#FFF1B5] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#43302E]/20 border-t-[#43302E] rounded-full animate-spin" />
    </div>
  );

  const pendingRequests = swaps.filter(s => s.status === 'PENDING' && s.receiver_id === user.id);
  const activeSwaps = swaps.filter(s => s.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-[#FFF1B5] relative pb-20">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center py-5 px-8 md:px-16 z-10 glass border-b border-[#43302E]/10 sticky top-0 mb-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#43302E] flex items-center justify-center">
            <Repeat className="text-[#FFF1B5] w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-2xl text-[#43302E] tracking-tight">PraMuse</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/explore" className="hidden md:block font-medium text-[#43302E]/70 hover:text-[#43302E] transition-colors text-sm">Explore</Link>
          <Link href="/inbox" className="relative hidden md:flex items-center gap-1 font-medium text-[#43302E]/70 hover:text-[#43302E] transition-colors text-sm">
            Inbox
            {pendingRequests.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
          </Link>
          <button onClick={() => router.push('/profile')} className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-white/50 hover:bg-white/40 transition-all">
            {user.avatar ? (
              <Image src={user.avatar} alt="Avatar" width={28} height={28} className="rounded-full" />
            ) : (
              <UserCircle className="w-7 h-7 text-[#43302E]" />
            )}
            <span className="text-sm font-medium text-[#43302E] hidden md:block">{user.name}</span>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-xl text-[#43302E]/60 hover:text-[#43302E] hover:bg-white/40 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 z-10 relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-heading font-bold text-[#43302E]">
            Welcome back, <span className="text-[#8A5A53]">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-[#43302E]/60 mt-2">Your live skills marketplace dashboard.</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div onClick={() => router.push("/inbox")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass p-6 rounded-3xl border border-white/40 shadow-lg cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center mb-4 text-[#43302E]"><ArrowRightLeft /></div>
            <p className="text-[#43302E]/60 text-sm font-medium">Active Swaps</p>
            <p className="text-3xl font-heading font-bold text-[#43302E] mt-1">{activeSwaps.length}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass p-6 rounded-3xl border border-white/40 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center mb-4 text-[#43302E]"><Star /></div>
            <p className="text-[#43302E]/60 text-sm font-medium">Trust Score</p>
            <p className="text-3xl font-heading font-bold text-[#43302E] mt-1">{user.trust_score?.toFixed(1)}</p>
          </motion.div>
          <motion.div onClick={() => router.push("/inbox")} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass p-6 rounded-3xl border border-white/40 shadow-lg relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all">
            {pendingRequests.length > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                {pendingRequests.length}
              </motion.div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center mb-4 text-[#43302E]"><LayoutDashboard /></div>
            <p className="text-[#43302E]/60 text-sm font-medium">Pending Requests</p>
            <p className="text-3xl font-heading font-bold text-[#43302E] mt-1">{pendingRequests.length}</p>
          </motion.div>
        </div>

        {/* AI Matchmaker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-10">
          <div className="glass p-8 rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-heading font-bold text-[#43302E] mb-2 flex items-center gap-2">
                  <Star className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" /> AI Magic Match
                </h3>
                <p className="text-[#43302E]/70 max-w-md">Our Llama-3 AI analyzes the live marketplace and finds your perfect skill-exchange partner.</p>
              </div>
              {!aiMatchResult && !isAiLoading ? (
                <button onClick={handleAiMatch} className="px-8 py-4 bg-[#43302E] text-[#FFF1B5] rounded-2xl font-bold hover:bg-[#43302E]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 whitespace-nowrap">
                  Find My Match
                </button>
              ) : isAiLoading ? (
                <div className="px-8 py-4 glass text-[#43302E] rounded-2xl font-bold flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#43302E]/20 border-t-[#43302E] rounded-full animate-spin" />
                  Analyzing live marketplace...
                </div>
              ) : (
                <div className="glass bg-white/50 p-4 rounded-2xl border border-white max-w-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold tracking-wider text-[#D4AF37] uppercase">Top Match Found</span>
                    <button onClick={() => setAiMatchResult(null)} className="text-[#43302E]/40 hover:text-[#43302E]"><X className="w-4 h-4" /></button>
                  </div>
                  <p className="text-[#43302E] font-medium text-sm leading-relaxed">{aiMatchResult!.reason}</p>
                  {(() => {
                    const matchedSkill = allSkills.find(s => s.id === aiMatchResult!.matchId);
                    if (!matchedSkill) return null;
                    return (
                      <button onClick={() => router.push(`/users/${matchedSkill.user.id}`)} className="mt-3 text-sm font-bold text-[#8A5A53] hover:text-[#43302E] flex items-center gap-1">
                        View Profile & Request Swap <ArrowRight className="w-4 h-4" />
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* My Skills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-[#43302E]">My Published Skills</h2>
            <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-[#43302E] text-[#FFF1B5] rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#43302E]/90 transition-all shadow-md">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="glass p-12 rounded-[2rem] text-center flex flex-col items-center justify-center border border-white/40 border-dashed">
              <Repeat className="w-12 h-12 text-[#43302E]/20 mb-4" />
              <h3 className="text-xl font-heading font-bold text-[#43302E] mb-2">Nothing published yet</h3>
              <p className="text-[#43302E]/60 mb-6 max-w-sm">Add your first skill to appear in the live marketplace.</p>
              <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#43302E] text-[#FFF1B5] rounded-2xl font-bold hover:bg-[#43302E]/90 transition-all">
                Publish Your First Skill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map(skill => (
                <motion.div key={skill.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass p-5 rounded-3xl border border-white/40 shadow-md flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#8A5A53] uppercase tracking-wider">{skill.category} · {skill.level}</span>
                    <h4 className="font-bold text-lg text-[#43302E] mt-1">{skill.title}</h4>
                    <p className="text-sm text-[#43302E]/60 mt-1">Seeking: {skill.seeking}</p>
                    {skill.availability && <p className="text-xs text-[#43302E]/40 mt-1">{skill.availability}</p>}
                  </div>
                  <button onClick={() => handleDeleteSkill(skill.id)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#43302E]/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[#FFF1B5] border border-white rounded-[2rem] p-8 shadow-2xl z-10">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/50 hover:bg-white text-[#43302E]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-[#43302E] mb-6">Publish a Skill</h2>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <input required placeholder="I can teach..." value={formData.offering} onChange={e => setFormData(f => ({ ...f, offering: e.target.value }))}
                className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl px-4 py-3 text-[#43302E] outline-none" />
              <input required placeholder="I want to learn..." value={formData.seeking} onChange={e => setFormData(f => ({ ...f, seeking: e.target.value }))}
                className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl px-4 py-3 text-[#43302E] outline-none" />
              <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl px-4 py-3 text-[#43302E] outline-none">
                {["Development", "Design", "Marketing", "Music", "Language", "Business", "Fitness", "Communication", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={formData.level} onChange={e => setFormData(f => ({ ...f, level: e.target.value }))}
                className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl px-4 py-3 text-[#43302E] outline-none">
                {["Beginner", "Intermediate", "Advanced", "Expert"].map(l => <option key={l}>{l}</option>)}
              </select>
              <input placeholder="Availability (e.g., Weekends)" value={formData.availability} onChange={e => setFormData(f => ({ ...f, availability: e.target.value }))}
                className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl px-4 py-3 text-[#43302E] outline-none" />
              <button type="submit" className="w-full bg-[#43302E] text-[#FFF1B5] py-4 rounded-xl font-bold hover:bg-[#43302E]/90 transition-all mt-2">
                Publish to Marketplace
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
