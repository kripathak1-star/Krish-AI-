import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ArrowRight, Github, Sparkles, Mail, Lock } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  const handleProviderLogin = (provider: 'github' | 'google') => {
    if (provider === 'github') setIsGitHubLoading(true);
    if (provider === 'google') setIsGoogleLoading(true);
    
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className={`w-full max-w-md p-8 relative z-10 transition-all duration-700 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Card Container */}
        <div className="bg-[#09090b]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 overflow-hidden relative group">
          
          {/* Subtle sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25 mb-6 relative group/icon">
              <Sparkles className="w-8 h-8 text-white relative z-10" strokeWidth={2} />
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
              <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3 text-white">
              Welcome to Krish AI
            </h1>
            <p className="text-lovable-textMuted text-base leading-relaxed">
              Sign in to build your dream app in seconds.
            </p>
          </div>

          {/* Social Auth */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleProviderLogin('github')}
                disabled={isGitHubLoading || isGoogleLoading || isLoading}
                className="h-12 bg-[#18181b] hover:bg-[#27272a] text-white border border-white/5 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 font-medium text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isGitHubLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Github size={18} />
                    <span>GitHub</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => handleProviderLogin('google')}
                disabled={isGitHubLoading || isGoogleLoading || isLoading}
                className="h-12 bg-[#18181b] hover:bg-[#27272a] text-white border border-white/5 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 font-medium text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isGoogleLoading ? (
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold">
                <span className="bg-[#09090b]/80 backdrop-blur px-3 text-lovable-textDim">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 group">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-lovable-textDim w-5 h-5 group-focus-within:text-indigo-400 transition-colors duration-300" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-12 bg-[#18181b] border border-lovable-border rounded-xl pl-12 pr-4 text-white placeholder-lovable-textDim/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                isLoading={isLoading}
                variant="secondary"
                disabled={isGitHubLoading || isGoogleLoading}
                className="w-full h-12 bg-white hover:bg-gray-200 text-black border-none font-bold text-sm rounded-xl group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Sign In 
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </form>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[11px] text-lovable-textDim/70">
              By continuing, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};