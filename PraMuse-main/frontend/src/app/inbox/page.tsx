"use client";

import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { Check, X, MessageSquare, Clock, Star, Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function InboxPage() {
  const { user, isAuthenticated } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"requests" | "swaps">("requests");
  const [swaps, setSwaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatSwap, setActiveChatSwap] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewSwapId, setReviewSwapId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.push('/auth'); return; }
    fetchSwaps();
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSwaps = async () => {
    if (!user) return;
    const res = await fetch(`/api/swaps?userId=${user.id}`);
    const data = res.ok ? await res.json() : [];
    setSwaps(data);
    setLoading(false);
  };

  const fetchMessages = useCallback(async (swapId: string) => {
    const res = await fetch(`/api/messages?swapId=${swapId}`);
    const data = res.ok ? await res.json() : [];
    setMessages(data);
  }, []);

  const openChat = async (swap: any) => {
    setActiveChatSwap(swap);
    fetchMessages(swap.id);
  };

  // Poll messages every 3 seconds when chat is open
  useEffect(() => {
    if (!activeChatSwap) return;
    const interval = setInterval(() => fetchMessages(activeChatSwap.id), 3000);
    return () => clearInterval(interval);
  }, [activeChatSwap?.id, fetchMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatSwap || !user) return;
    const text = messageInput;
    setMessageInput("");
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ swap_id: activeChatSwap.id, sender_id: user.id, text })
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages(m => [...m, msg]);
    }
  };

  const acceptRequest = async (swapId: string) => {
    await fetch(`/api/swaps/${swapId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ACCEPTED' }) });
    toast.success("Swap Accepted!");
    fetchSwaps();
  };

  const declineRequest = async (swapId: string) => {
    await fetch(`/api/swaps/${swapId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) });
    toast.info("Request declined.");
    fetchSwaps();
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSwapId || !user) return;
    const swap = swaps.find(s => s.id === reviewSwapId);
    if (!swap) return;
    const reviewedId = swap.sender_id === user.id ? swap.receiver_id : swap.sender_id;
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewer_id: user.id, reviewed_id: reviewedId, rating, feedback: reviewText })
    });
    await fetch(`/api/swaps/${reviewSwapId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COMPLETED' }) });
    toast.success("Review submitted! Trust score updated.");
    setIsReviewOpen(false);
    setReviewSwapId(null);
    fetchSwaps();
  };

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

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 z-10 relative pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-[#43302E] mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8" /> Inbox
          </h1>
          <p className="text-[#43302E]/70">Manage your real-time swap requests and partnerships.</p>
        </motion.div>

        <div className="flex items-center gap-4 mb-8">
          {[['requests', 'Pending Requests', pendingRequests.length], ['swaps', 'Active Swaps', activeSwaps.length]].map(([tab, label, count]) => (
            <button key={tab as string} onClick={() => setActiveTab(tab as "requests" | "swaps")}
              className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === tab ? "bg-[#43302E] text-[#FFF1B5] shadow-lg" : "glass text-[#43302E] hover:bg-white/40"}`}>
              {label}
              {(count as number) > 0 && <span className={`text-xs px-2 py-0.5 rounded-full text-white ${activeTab === tab ? 'bg-white/30' : 'bg-[#43302E]/70'}`}>{count}</span>}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#43302E]/40" /></div> : (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {activeTab === "requests" && (
              pendingRequests.length > 0 ? pendingRequests.map(req => (
                <div key={req.id} className="glass p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/40">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {req.sender.avatar && <Image src={req.sender.avatar} alt="Avatar" width={56} height={56} className="rounded-full border-2 border-white shadow-sm" />}
                    <div>
                      <h4 className="font-bold text-lg text-[#43302E]">{req.sender.name}</h4>
                      <p className="text-[#43302E]/70 text-sm">wants to swap <span className="font-semibold text-[#8A5A53]">"{req.offered_skill.title}"</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => declineRequest(req.id)} className="flex-1 md:flex-none px-4 py-2 rounded-xl text-red-600 bg-red-100 font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
                      <X className="w-4 h-4" /> Decline
                    </button>
                    <button onClick={() => acceptRequest(req.id)} className="flex-1 md:flex-none px-6 py-2 rounded-xl text-white bg-green-600 font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md">
                      <Check className="w-4 h-4" /> Accept
                    </button>
                  </div>
                </div>
              )) : (
                <div className="glass p-12 rounded-[2rem] text-center border border-white/40 border-dashed">
                  <Clock className="w-12 h-12 text-[#43302E]/30 mb-4 mx-auto" />
                  <h3 className="text-xl font-heading font-bold text-[#43302E] mb-2">No pending requests</h3>
                  <p className="text-[#43302E]/60 max-w-sm mx-auto">When someone wants to trade skills with you, it will appear here.</p>
                </div>
              )
            )}

            {activeTab === "swaps" && (
              activeSwaps.length > 0 ? activeSwaps.map(swap => {
                const partner = swap.sender_id === user.id ? swap.receiver : swap.sender;
                return (
                  <div key={swap.id} className="glass p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/40 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {partner.avatar && <Image src={partner.avatar} alt="Avatar" width={56} height={56} className="rounded-full border-2 border-white shadow-sm" />}
                      <div>
                        <h4 className="font-bold text-lg text-[#43302E]">{partner.name}</h4>
                        <p className="text-[#43302E]/70 text-sm">Trading: <span className="font-semibold text-[#8A5A53]">"{swap.offered_skill.title}"</span></p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button onClick={() => openChat(swap)} className="flex-1 md:flex-none px-4 py-2 rounded-xl text-[#43302E] bg-white/60 font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 border border-white shadow-sm">
                        <MessageSquare className="w-4 h-4" /> Chat
                      </button>
                      <button onClick={() => { setReviewSwapId(swap.id); setIsReviewOpen(true); }} className="flex-1 md:flex-none px-6 py-2 rounded-xl text-white bg-[#43302E] font-bold hover:bg-[#43302E]/90 transition-colors flex items-center justify-center gap-2 shadow-md">
                        <Star className="w-4 h-4 text-[#FFF1B5]" /> Complete
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="glass p-12 rounded-[2rem] text-center border border-white/40 border-dashed">
                  <MessageSquare className="w-12 h-12 text-[#43302E]/30 mb-4 mx-auto" />
                  <h3 className="text-xl font-heading font-bold text-[#43302E] mb-2">No active swaps</h3>
                  <p className="text-[#43302E]/60 max-w-sm mx-auto">Accept a request to start a real skill exchange.</p>
                </div>
              )
            )}
          </motion.div>
        )}
      </main>

      {/* Live Chat Modal */}
      {activeChatSwap && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4 pointer-events-none">
          <div className="absolute inset-0 bg-[#43302E]/20 backdrop-blur-sm pointer-events-auto" onClick={() => setActiveChatSwap(null)} />
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
            className="relative w-full sm:max-w-md h-[80vh] sm:h-[600px] bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl z-10 flex flex-col overflow-hidden pointer-events-auto border border-[#43302E]/10">
            <div className="bg-[#FFF1B5] p-4 flex items-center justify-between border-b border-[#43302E]/10">
              <div className="flex items-center gap-3">
                {activeChatSwap.sender_id === user.id ? activeChatSwap.receiver.avatar && <Image src={activeChatSwap.receiver.avatar} alt="" width={36} height={36} className="rounded-full" /> : activeChatSwap.sender.avatar && <Image src={activeChatSwap.sender.avatar} alt="" width={36} height={36} className="rounded-full" />}
                <div>
                  <h3 className="font-bold text-[#43302E]">{activeChatSwap.sender_id === user.id ? activeChatSwap.receiver.name : activeChatSwap.sender.name}</h3>
                  <p className="text-xs text-[#43302E]/60">Active Swap</p>
                </div>
              </div>
              <button onClick={() => setActiveChatSwap(null)} className="p-2 rounded-full hover:bg-white/50"><X className="w-5 h-5 text-[#43302E]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello! 👋</p>}
              {messages.map(msg => {
                const isMe = msg.sender_id === user.id;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${isMe ? 'bg-[#43302E] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 bg-white border-t border-gray-100">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#43302E]/20" />
                <button type="submit" disabled={!messageInput.trim()} className="bg-[#43302E] text-white p-2.5 rounded-xl disabled:opacity-40 transition-opacity">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#43302E]/60 backdrop-blur-sm" onClick={() => setIsReviewOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-[#FFF1B5] border border-white rounded-[2rem] p-8 shadow-2xl z-10">
            <button onClick={() => setIsReviewOpen(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/50"><X className="w-5 h-5 text-[#43302E]" /></button>
            <h2 className="text-2xl font-heading font-bold text-[#43302E] mb-2">Leave a Review</h2>
            <p className="text-[#43302E]/70 mb-6 text-sm">Your review updates their live Trust Score on the platform.</p>
            <form onSubmit={submitReview} className="space-y-5">
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map(star => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1.5 transition-transform hover:scale-110">
                    <Star className={`w-9 h-9 ${rating >= star ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#43302E]/20'}`} />
                  </button>
                ))}
              </div>
              <textarea required value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." className="w-full bg-white/60 border border-white focus:border-[#43302E]/30 rounded-2xl p-4 text-[#43302E] outline-none min-h-[100px] resize-none" />
              <button type="submit" className="w-full bg-[#43302E] text-[#FFF1B5] py-3.5 rounded-xl font-bold hover:bg-[#43302E]/90 transition-all">Submit Review</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
