import React from 'react';
import { Button } from './Button';
import { Shield, FileText, CheckCircle2, Lock } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-[480px] bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col relative">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 pb-0 text-center relative z-10">
          <div className="w-16 h-16 bg-[#18181b] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/5">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Krish AI</h2>
          <p className="text-lovable-textMuted text-sm leading-relaxed max-w-xs mx-auto">
            Please review and accept our policies to start building your applications.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 relative z-10">
          <div className="space-y-3">
            <div className="group flex gap-4 p-4 bg-[#18181b] rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-default">
              <div className="mt-1">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Terms of Service</h3>
                <p className="text-xs text-lovable-textDim mt-1 leading-relaxed">
                  You own the code you generate. You are responsible for the applications you deploy using our platform.
                </p>
              </div>
            </div>

            <div className="group flex gap-4 p-4 bg-[#18181b] rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-default">
              <div className="mt-1">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Privacy Policy</h3>
                <p className="text-xs text-lovable-textDim mt-1 leading-relaxed">
                  We use Google's Gemini API for processing. Your data is encrypted and handled securely.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={onAccept}
              className="w-full h-14 bg-white hover:bg-gray-100 text-black border-none font-bold text-base shadow-lg shadow-white/5 rounded-2xl flex items-center justify-center gap-2 group transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              I Accept & Continue
              <CheckCircle2 size={20} className="text-black group-hover:scale-110 transition-transform" />
            </Button>
            <p className="text-center text-[10px] text-lovable-textDim/50 mt-4">
              By clicking "I Accept", you verify that you are at least 13 years of age.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};