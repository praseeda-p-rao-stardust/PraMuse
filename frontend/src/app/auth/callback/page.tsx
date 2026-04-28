"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { Repeat } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const handleAuth = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const u = session.user;
          // Try to get name from metadata or localStorage (magic link flow)
          const pendingName = localStorage.getItem("pramuse-pending-name");
          const displayName = pendingName || u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || "User";
          localStorage.removeItem("pramuse-pending-name");
          
          // Sync with our Prisma DB
          await useStore.getState().login(u.email!, displayName);
          router.replace("/dashboard");
        } else {
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/auth");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF1B5] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#43302E] flex items-center justify-center animate-pulse">
        <Repeat className="text-[#FFF1B5] w-6 h-6" />
      </div>
      <p className="text-[#43302E]/60 font-medium text-sm">Signing you in...</p>
      <div className="w-6 h-6 border-2 border-[#43302E]/20 border-t-[#43302E] rounded-full animate-spin" />
    </div>
  );
}
