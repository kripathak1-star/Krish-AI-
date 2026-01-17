import React from 'react';
import { X, Users, Shield, Info, Heart } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  type: 'about' | 'team' | 'policy' | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const content = {
    about: {
      title: 'About Krish AI',
      icon: <Info className="text-blue-400" />,
      body: (
        <div className="space-y-4 text-lovable-text leading-relaxed">
          <p>
            <span className="text-white font-semibold">Krish AI</span> is a next-generation AI-powered web builder designed to democratize software creation. Our mission is to empower anyone, regardless of technical skill, to bring their ideas to life instantly.
          </p>
          <p>
            Powered by Google's Gemini models, we provide state-of-the-art code generation, real-time previewing, and seamless deployment capabilities. Whether you are building a startup MVP, a personal portfolio, or an internal tool, Krish AI writes the code so you can focus on the vision.
          </p>
          <div className="flex items-center gap-2 text-sm text-lovable-textDim pt-2">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> by the Krish AI Team.
          </div>
        </div>
      )
    },
    team: {
      title: 'Our Team',
      icon: <Users className="text-purple-400" />,
      body: (
        <div className="space-y-6">
          <p className="text-lovable-textMuted text-sm">Meet the minds behind the magic.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-lovable-surface rounded-xl border border-lovable-border hover:border-indigo-500/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">K</div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Krish</h3>
                  <p className="text-xs text-lovable-textDim">Founder & Lead Engineer</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-lovable-surface rounded-xl border border-lovable-border hover:border-blue-500/50 transition-colors group">
               <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">G</div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">Gemini</h3>
                  <p className="text-xs text-lovable-textDim">Core AI Intelligence</p>
                </div>
              </div>
            </div>
             <div className="p-4 bg-lovable-surface rounded-xl border border-lovable-border hover:border-green-500/50 transition-colors group">
               <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">A</div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">Alex</h3>
                  <p className="text-xs text-lovable-textDim">Product Design</p>
                </div>
              </div>
            </div>
             <div className="p-4 bg-lovable-surface rounded-xl border border-lovable-border hover:border-orange-500/50 transition-colors group">
               <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">S</div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">Sarah</h3>
                  <p className="text-xs text-lovable-textDim">Community Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    policy: {
      title: 'Privacy & Terms',
      icon: <Shield className="text-green-400" />,
      body: (
        <div className="space-y-4 text-sm text-lovable-textMuted h-80 overflow-y-auto pr-2 custom-scrollbar">
          <div className="p-4 bg-lovable-surface rounded-lg border border-lovable-border">
            <h4 className="text-white font-medium mb-2">1. Data Privacy</h4>
            <p>We respect your privacy. All code generated is owned by you. We do not use your private project data to train public models without your explicit consent. Your prompts are processed via Google Gemini API under strict enterprise data protection standards.</p>
          </div>
          
          <div className="p-4 bg-lovable-surface rounded-lg border border-lovable-border">
            <h4 className="text-white font-medium mb-2">2. Terms of Service</h4>
            <p>By using Krish AI, you agree to use the generated code responsibly. We are not liable for any issues arising from the deployment of generated applications. You are responsible for reviewing the code before deployment.</p>
          </div>
          
          <div className="p-4 bg-lovable-surface rounded-lg border border-lovable-border">
            <h4 className="text-white font-medium mb-2">3. Usage Limits</h4>
            <p>Free tier users have access to limited generations per day. Pro tier users enjoy unlimited access, higher speed generation, and advanced features like custom domains and export options.</p>
          </div>

          <div className="p-4 bg-lovable-surface rounded-lg border border-lovable-border">
             <h4 className="text-white font-medium mb-2">4. User Content</h4>
             <p>You retain all rights to the text, images, and other content you submit to the service. We claim no ownership over your intellectual property.</p>
          </div>
        </div>
      )
    }
  };

  const current = content[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#09090b] border border-lovable-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-lovable-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/5">
              {current.icon}
            </div>
            <h2 className="text-xl font-semibold text-white">{current.title}</h2>
          </div>
          <button onClick={onClose} className="text-lovable-textMuted hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {current.body}
        </div>
      </div>
    </div>
  );
};