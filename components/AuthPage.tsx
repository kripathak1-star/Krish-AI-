
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ArrowRight, Github, Sparkles, Mail, Gift } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [invitedBy, setInvitedBy] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setInvitedBy(ref);
      // Clean up URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Cinematic Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-50%] left-[-50%] right-[-50%] bottom-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,#18181b_90deg,transparent_180deg,#18181b_270deg,transparent_360deg)] opacity-10 animate-[spin_20s_linear_infinite]"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20 animate-aurora background-size-[200%_200%]"></div>
         <div className="absolute top-[-20%] left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
         <div className="absolute bottom-[-20%] right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`w-full max-w-md p-8 relative z-10 transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Invitation Badge */}
        {invitedBy && (
          <div className="mb-6 animate-slide-up flex justify-center">
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/30 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
               <Gift size={14} className="text-yellow-400" />
               <span className="text-xs font-semibold text-yellow-200">You've been invited! Get 2x Speed Free</span>
            </div>
          </div>
        )}

        {/* Glass Card */}
        <div className="bg-[#09090b]/60 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl p-8 overflow-hidden relative group ring-1 ring-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6 relative group/icon">
              <Sparkles className="w-8 h-8 text-white relative z-10" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white drop-shadow-sm">Krish AI</h1>
            <p className="text-white/40 text-base font-medium">Build software at the speed of thought.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleLogin({ preventDefault: () => {} } as any)}
                className="h-12 bg-[#18181b] hover:bg-[#27272a] text-white border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-lg font-medium text-sm group"
              >
                <Github size={18} className="text-white/70 group-hover:text-white transition-colors" />
                <span>GitHub</span>
              </button>
              <button 
                onClick={() => handleLogin({ preventDefault: () => {} } as any)}
                className="h-12 bg-[#18181b] hover:bg-[#27272a] text-white border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-lg font-medium text-sm group"
              >
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                   <span className="text-[10px] font-bold text-black">G</span>
                </div>
                <span>Google</span>
              </button>
            </div>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-[#0c0c0e] px-3 text-white/20">Or</span></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="group relative">
                <Mail className="absolute left-4 top-3.5 text-white/30 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@work.com"
                  className="w-full h-12 bg-[#121214] border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                  required
                />
              </div>
              <Button type="submit" isLoading={isLoading} className="w-full h-12 bg-white hover:bg-gray-100 text-black border-none font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
                {invitedBy ? 'Join & Claim Reward' : 'Sign In'} <ArrowRight size={16} className="ml-2" />
              </Button>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-white/20 font-medium">By continuing, you accept our Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
