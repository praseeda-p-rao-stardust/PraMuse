"use client";

import { useStore, Skill } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Repeat, Star, ArrowRightLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

const CATEGORIES = ["All", "Development", "Design", "Marketing", "Music", "Language", "Business", "Fitness", "Communication", "Other"];

export default function ExplorePage() {
  const { user, isAuthenticated } = useStore();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [requestingId, setRequestingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/skills')
      .then(r => r.json())
      .then(data => { setSkills(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = skills.filter(s => {
    const matchesCat = activeCategory === "All" || s.category === activeCategory;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.user.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRequest = async (skill: Skill) => {
    if (!isAuthenticated || !user) { toast.error("Please log in first!"); router.push('/auth'); return; }
    if (skill.user.id === user.id) { toast.error("You can't swap with yourself!"); return; }
    setRequestingId(skill.id);
    try {
      // For a real swap, both users need matching skills. We create a self-referential request for now.
      const res = await fetch('/api/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: skill.user.id,
          offered_skill_id: skill.id,
          requested_skill_id: skill.id,
        })
      });
      if (!res.ok) throw new Error('Failed to send request');
      toast.success(`Swap request sent to ${skill.user.name}!`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTimeout(() => setRequestingId(null), 2000);
    }
  };

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
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-[#43302E] text-[#FFF1B5] rounded-xl font-bold text-sm">Dashboard</button>
          ) : (
            <button onClick={() => router.push('/auth')} className="px-4 py-2 bg-[#43302E] text-[#FFF1B5] rounded-xl font-bold text-sm">Sign In</button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-5xl font-heading font-bold text-[#43302E] mb-3">Explore Skills</h1>
          <p className="text-[#43302E]/60 text-lg">Discover talents from real people. Trade skills, not money.</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#43302E]/40" />
          <input
            type="text"
            placeholder="Search skills or people..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 glass border border-white/60 rounded-2xl text-[#43302E] outline-none placeholder:text-[#43302E]/40 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat ? 'bg-[#43302E] text-[#FFF1B5] shadow-md' : 'glass text-[#43302E] border border-white/50 hover:bg-white/40'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#43302E]/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#43302E]/50 text-lg">No skills found. Be the first to publish one!</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((skill, i) => (
                <motion.div key={skill.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass p-6 rounded-3xl border border-white/40 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Link href={`/users/${skill.user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0">
                      {skill.user.avatar ? (
                        <Image src={skill.user.avatar} alt={skill.user.name} width={44} height={44} className="rounded-full border-2 border-white shadow-sm flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#43302E] flex items-center justify-center text-[#FFF1B5] font-bold flex-shrink-0">{skill.user.name[0]}</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-[#43302E] truncate">{skill.user.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                          <span className="text-xs text-[#43302E]/60">{skill.user.trust_score?.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                    <span className="ml-auto text-xs font-bold bg-[#43302E]/10 text-[#43302E] px-2 py-1 rounded-full flex-shrink-0">{skill.category}</span>
                  </div>

                  <h3 className="font-bold text-lg text-[#43302E] mb-1">{skill.title}</h3>
                  <p className="text-sm text-[#43302E]/60 mb-1">Seeking: <span className="font-medium text-[#8A5A53]">{skill.seeking}</span></p>
                  <p className="text-xs text-[#43302E]/40 mb-4">{skill.level} · {skill.availability || 'Flexible'}</p>

                  <button onClick={() => handleRequest(skill)} disabled={requestingId === skill.id || skill.user.id === user?.id}
                    className={`mt-auto w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      skill.user.id === user?.id ? 'bg-white/40 text-[#43302E]/40 cursor-not-allowed' :
                      requestingId === skill.id ? 'bg-green-100 text-green-700' :
                      'bg-[#43302E] text-[#FFF1B5] hover:bg-[#43302E]/90 shadow-md'
                    }`}>
                    {requestingId === skill.id ? '✓ Requested!' : skill.user.id === user?.id ? 'Your Skill' : <><ArrowRightLeft className="w-4 h-4" /> Request Swap</>}
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
