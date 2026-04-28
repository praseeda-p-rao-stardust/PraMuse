"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Star, Repeat, ArrowRightLeft, Calendar } from "lucide-react";
import { useStore } from "@/store/useStore";

type PublicProfile = {
  id: string;
  name: string;
  avatar: string | null;
  trust_score: number;
  created_at: string;
  skills: Array<{ id: string; title: string; seeking: string; category: string; level: string; availability: string | null }>;
  reviews_received: Array<{ id: string; rating: number; feedback: string | null; created_at: string; reviewer: { id: string; name: string; avatar: string | null } }>;
};

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useStore();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleRequest = async (skillId: string) => {
    if (!isAuthenticated || !currentUser) { router.push('/auth'); return; }
    setRequesting(skillId);
    await fetch('/api/swaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: currentUser.id,
        receiver_id: id,
        offered_skill_id: skillId,
        requested_skill_id: skillId,
      }),
    });
    setTimeout(() => setRequesting(null), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FFF1B5] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#43302E]/20 border-t-[#43302E] rounded-full animate-spin" />
    </div>
  );

  if (!profile || 'error' in profile) return (
    <div className="min-h-screen bg-[#FFF1B5] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-[#43302E]">User not found</h2>
        <Link href="/explore" className="text-[#8A5A53] mt-4 inline-block hover:underline">← Back to Explore</Link>
      </div>
    </div>
  );

  const isOwnProfile = currentUser?.id === profile.id;
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#FFF1B5] pb-20">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <nav className="w-full flex justify-between items-center py-5 px-8 md:px-16 z-10 glass border-b border-[#43302E]/10 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#43302E] flex items-center justify-center"><Repeat className="text-[#FFF1B5] w-5 h-5" /></div>
          <span className="font-heading font-bold text-2xl text-[#43302E] tracking-tight">PraMuse</span>
        </Link>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#43302E]/70 hover:text-[#43302E] font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-[2.5rem] border border-white/40 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <Image src={profile.avatar} alt={profile.name} width={100} height={100} className="rounded-full border-4 border-white shadow-xl w-24 h-24 object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#43302E] flex items-center justify-center text-[#FFF1B5] text-4xl font-bold border-4 border-white shadow-xl">
                  {profile.name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-heading font-bold text-[#43302E] mb-1">{profile.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${profile.trust_score >= s ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#43302E]/20'}`} />
                  ))}
                  <span className="text-sm font-bold text-[#43302E] ml-1">{profile.trust_score.toFixed(1)}</span>
                </div>
                <span className="text-[#43302E]/40 text-xs">·</span>
                <div className="flex items-center gap-1.5 text-[#43302E]/60 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {joinDate}</span>
                </div>
                <span className="text-[#43302E]/40 text-xs">·</span>
                <div className="flex items-center gap-1.5 text-[#43302E]/60 text-sm">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{profile.skills.length} skills</span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Link href="/profile" className="glass px-4 py-2 rounded-xl text-[#43302E] font-bold text-sm border border-white/50 hover:bg-white/40 transition-all">
                Edit Profile
              </Link>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Skills */}
          <div className="md:col-span-3">
            <h2 className="text-xl font-heading font-bold text-[#43302E] mb-4">Published Skills</h2>
            {profile.skills.length === 0 ? (
              <div className="glass p-8 rounded-[2rem] text-center border border-dashed border-white/60">
                <p className="text-[#43302E]/50">No skills published yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.skills.map(skill => (
                  <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="glass p-5 rounded-2xl border border-white/40 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#8A5A53] uppercase tracking-wider">{skill.category} · {skill.level}</span>
                      </div>
                      <h4 className="font-bold text-[#43302E]">{skill.title}</h4>
                      <p className="text-sm text-[#43302E]/60">Wants: {skill.seeking}</p>
                    </div>
                    {!isOwnProfile && currentUser && (
                      <button
                        onClick={() => handleRequest(skill.id)}
                        disabled={requesting === skill.id}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${requesting === skill.id ? 'bg-green-100 text-green-700' : 'bg-[#43302E] text-[#FFF1B5] hover:bg-[#43302E]/90 shadow-md'}`}
                      >
                        {requesting === skill.id ? '✓ Sent!' : 'Request Swap'}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-heading font-bold text-[#43302E] mb-4">Reviews <span className="text-[#43302E]/40 text-sm font-normal">({profile.reviews_received.length})</span></h2>
            {profile.reviews_received.length === 0 ? (
              <div className="glass p-8 rounded-[2rem] text-center border border-dashed border-white/60">
                <p className="text-[#43302E]/50 text-sm">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.reviews_received.map(review => (
                  <motion.div key={review.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    className="glass p-4 rounded-2xl border border-white/40">
                    <div className="flex items-center gap-2 mb-2">
                      {review.reviewer.avatar ? (
                        <Image src={review.reviewer.avatar} alt="" width={28} height={28} className="rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#43302E] flex items-center justify-center text-[#FFF1B5] text-xs font-bold">
                          {review.reviewer.name[0]}
                        </div>
                      )}
                      <span className="text-sm font-bold text-[#43302E]">{review.reviewer.name}</span>
                      <div className="flex ml-auto">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${review.rating >= s ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#43302E]/20'}`} />)}
                      </div>
                    </div>
                    {review.feedback && <p className="text-sm text-[#43302E]/70 leading-relaxed">"{review.feedback}"</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
