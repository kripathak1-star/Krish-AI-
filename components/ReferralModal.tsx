
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Copy, Check, Gift, Zap, Crown, Globe, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(2);
  const [referralLink, setReferralLink] = useState('');
  const totalRequired = 5;

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#ffffff']
      });
    }
  }, [isOpen]);

  useEffect(() => {
    // Robust link generation for GitHub Pages and other subpath deployments
    try {
        // Get or create a persistent user ID for the referral code
        let userId = localStorage.getItem('krish_ai_user_id');
        if (!userId) {
        userId = Math.random().toString(36).substring(2, 9);
        localStorage.setItem('krish_ai_user_id', userId);
        }

        // Use the current full URL as base to respect subpaths (like /repo-name/)
        const url = new URL(window.location.href);
        // Clear existing params to avoid stacking
        url.search = ''; 
        url.hash = ''; // Clear hash if any
        url.searchParams.set('ref', userId);
        
        setReferralLink(url.toString());
    } catch (e) {
        // Fallback
        setReferralLink(window.location.origin);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const progress = (referralCount / totalRequired) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-up relative">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        {/* Header */}
        <div className="p-8 pb-4 text-center relative z-10">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-6 ring-1 ring-white/20">
            <Gift className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Get Krish AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Pro</span> for Free</h2>
          <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed">
            Invite friends to join the AI revolution. Unlock premium features forever when they sign up.
          </p>
        </div>

        {/* Main Content */}
        <div className="p-8 pt-4 space-y-8 relative z-10">
          
          {/* Progress Tracker */}
          <div className="bg-[#18181b] rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Your Progress</span>
                <div className="text-3xl font-bold text-white mt-1">{referralCount} <span className="text-white/30 text-lg font-normal">/ {totalRequired} Friends</span></div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
                  {totalRequired - referralCount} more to go
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
              </div>
              
              {/* Milestones Dots */}
              <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-black/20 z-10"></div>
              <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-black/20 z-10"></div>
            </div>

            {/* Milestones Labels */}
            <div className="flex justify-between mt-3 text-xs font-medium text-white/40">
              <div className="flex flex-col items-center gap-1 opacity-50">
                <span>Start</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-indigo-400">
                <Zap size={12} />
                <span>Fast Mode</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-purple-400">
                <Globe size={12} />
                <span>Custom Domain</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-yellow-500 font-bold">
                <Crown size={12} />
                <span>LIFETIME PRO</span>
              </div>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-3">
             <label className="text-sm font-medium text-white/70 ml-1">Share your unique invite link</label>
             <div className="flex gap-2">
               <div className="flex-1 h-12 bg-black border border-white/10 rounded-xl flex items-center px-4 relative group">
                 <Share2 size={16} className="text-white/30 mr-3" />
                 <input 
                    readOnly 
                    value={referralLink}
                    className="bg-transparent border-none outline-none text-white/80 w-full font-mono text-sm"
                 />
                 <div className="absolute inset-0 border border-indigo-500/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
               </div>
               <Button 
                  onClick={handleCopy}
                  className={`h-12 px-6 rounded-xl font-bold transition-all border-none text-white shadow-lg ${
                    copied 
                    ? 'bg-green-600 hover:bg-green-500' 
                    : 'bg-white text-black hover:bg-gray-200'
                  }`}
               >
                 {copied ? (
                   <>
                    <Check size={18} className="mr-2" /> Copied!
                   </>
                 ) : (
                   <>
                    <Copy size={18} className="mr-2" /> Copy Link
                   </>
                 )}
               </Button>
             </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-3 gap-4">
             <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Zap size={20} /></div>
                <div className="text-xs font-bold text-white">2x Speed</div>
                <div className="text-[10px] text-white/40">Generate apps faster</div>
             </div>
             <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Globe size={20} /></div>
                <div className="text-xs font-bold text-white">Custom Domain</div>
                <div className="text-[10px] text-white/40">Publish to .com</div>
             </div>
             <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 flex flex-col items-center text-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400 relative z-10"><Crown size={20} /></div>
                <div className="text-xs font-bold text-white relative z-10">Pro Badge</div>
                <div className="text-[10px] text-white/40 relative z-10">Profile status</div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
