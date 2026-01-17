import React, { useState } from 'react';
import { Button } from './Button';
import { ArrowRight, Github, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md p-8 relative z-10 animate-slide-up">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25 mb-6 group transition-transform hover:scale-105 duration-500">
            <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Krish AI
          </h1>
          <p className="text-lovable-textMuted text-lg">
            Turn ideas into software, instantly.
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-4">
          <button 
            onClick={() => handleLogin({ preventDefault: () => {} } as any)} 
            className="w-full h-12 bg-white text-black hover:bg-gray-200 border border-transparent rounded-xl flex items-center justify-center gap-3 transition-all font-semibold text-sm shadow-lg shadow-white/5"
          >
            <Github size={20} />
            Continue with GitHub
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-black px-4 text-lovable-textDim">Or</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-12 bg-lovable-surface border border-lovable-border rounded-xl px-4 text-white placeholder-lovable-textDim focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                required
              />
            </div>
            <Button 
              type="submit" 
              isLoading={isLoading}
              variant="secondary"
              className="w-full h-12 bg-lovable-surfaceHighlight hover:bg-lovable-border border-lovable-border text-white font-medium rounded-xl"
            >
              Sign In with Email <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-lovable-textDim">
            By continuing, you agree to our <a href="#" className="underline hover:text-white transition-colors">Terms</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};