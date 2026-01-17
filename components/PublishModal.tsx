import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Globe, Check, Loader2, Rocket, Layout, Settings, Sparkles, AlertCircle, Download, Terminal, ExternalLink, ShoppingCart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeploymentStatus, DeploymentConfig } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, code }) => {
  const [step, setStep] = useState<DeploymentStatus>('idle');
  const [activeTab, setActiveTab] = useState<'publish' | 'export'>('publish');
  const [config, setConfig] = useState<DeploymentConfig>({ type: 'subdomain', domain: '' });
  const [deployedUrl, setDeployedUrl] = useState('');
  const [error, setError] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('idle');
      setDeployedUrl('');
      setError('');
      setActiveTab('publish');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePublish = () => {
    if (!config.domain) {
      setError('Please enter a valid name for your app');
      return;
    }
    
    setStep('building');
    setError('');
    
    // Simulate deployment process
    setTimeout(() => setStep('optimizing'), 1500);
    setTimeout(() => setStep('uploading'), 3000);
    setTimeout(() => {
      setStep('deployed');
      const url = config.type === 'subdomain' 
        ? `https://${config.domain}.krish.ai` 
        : `https://${config.domain}`;
      setDeployedUrl(url);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 4500);
  };

  const handleOpenLive = () => {
    // Create a blob and open it to simulate the live site since we don't have a real backend
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'krish-ai-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-lovable-surface border border-lovable-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-lovable-border bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-krish-500/10 flex items-center justify-center ring-1 ring-krish-500/20">
              <Rocket className="text-krish-400 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Publish & Export</h2>
              <p className="text-xs text-lovable-textMuted">Make your app live or export code</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-lovable-textMuted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-lovable-border">
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'publish' ? 'text-white' : 'text-lovable-textMuted hover:text-white'
            }`}
          >
            Publish to Web
            {activeTab === 'publish' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-krish-500"></div>}
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'export' ? 'text-white' : 'text-lovable-textMuted hover:text-white'
            }`}
          >
            Export & Integrations
            {activeTab === 'export' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-krish-500"></div>}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'publish' ? (
            step === 'idle' ? (
              <>
                {/* Domain Tabs */}
                <div className="flex p-1.5 bg-black rounded-lg border border-lovable-border">
                  <button
                    onClick={() => setConfig({ ...config, type: 'subdomain' })}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all ${
                      config.type === 'subdomain' 
                        ? 'bg-lovable-surfaceHighlight text-white shadow-sm' 
                        : 'text-lovable-textMuted hover:text-white'
                    }`}
                  >
                    <Layout size={16} className="mr-2" />
                    Free Subdomain
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, type: 'custom' })}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all relative ${
                      config.type === 'custom' 
                        ? 'bg-lovable-surfaceHighlight text-white shadow-sm' 
                        : 'text-lovable-textMuted hover:text-white'
                    }`}
                  >
                    <Globe size={16} className="mr-2" />
                    Custom Domain
                    <span className="ml-2 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-[9px] font-bold text-black rounded uppercase tracking-wide flex items-center">
                      Pro
                    </span>
                  </button>
                </div>

                {/* Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-lovable-textMuted flex items-center justify-between">
                    {config.type === 'subdomain' ? 'Choose your subdomain' : 'Enter your domain'}
                    {error && <span className="text-red-400 text-xs flex items-center"><AlertCircle size={10} className="mr-1"/>{error}</span>}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={config.domain}
                      onChange={(e) => {
                        setConfig({ ...config, domain: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') });
                        setError('');
                      }}
                      placeholder={config.type === 'subdomain' ? "my-cool-app" : "example.com"}
                      className="flex-1 bg-black border border-lovable-border rounded-l-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-krish-500/50 focus:border-krish-500/50 transition-all placeholder-lovable-textDim"
                      autoFocus
                    />
                    {config.type === 'subdomain' && (
                      <div className="bg-lovable-surfaceHighlight border border-l-0 border-lovable-border rounded-r-lg py-3 px-4 text-lovable-textMuted text-sm font-mono">
                        .krish.ai
                      </div>
                    )}
                    {config.type === 'custom' && (
                      <div className="bg-lovable-surfaceHighlight border border-l-0 border-lovable-border rounded-r-lg py-3 px-4 text-lovable-textMuted text-sm">
                        <Settings size={14} />
                      </div>
                    )}
                  </div>
                  {config.type === 'custom' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-yellow-200/80 leading-relaxed">
                            Custom domains are available on the <strong>Pro Plan</strong>. 
                            You will need to configure a CNAME record pointing to <code>publish.krish.ai</code>.
                            </p>
                        </div>

                        {/* GoDaddy Integration */}
                        <div className="pt-2 pb-2 border-t border-lovable-border">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-lovable-text">Don't have a domain yet?</span>
                            </div>
                            <a 
                                href={`https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=${config.domain || 'example.com'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between w-full p-3 bg-[#1BDBDB] hover:bg-[#18c5c5] text-black rounded-lg transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <ShoppingCart size={18} className="text-black/70" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold text-black">Buy on GoDaddy</span>
                                        <span className="text-[10px] text-black/70 font-medium">Search & Register Instantly</span>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-black/60 group-hover:text-black transition-colors" />
                            </a>
                        </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button 
                    variant="primary" 
                    className="w-full h-12 text-base shadow-lg shadow-krish-500/20 hover:shadow-krish-500/30 border-none"
                    onClick={handlePublish}
                  >
                    {config.type === 'custom' ? 'Upgrade & Publish' : 'Publish Now'}
                  </Button>
                </div>
              </>
            ) : step !== 'deployed' ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-krish-500/20 blur-xl rounded-full"></div>
                  <Loader2 className="w-16 h-16 text-krish-400 animate-spin relative z-10" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-semibold text-white">
                    {step === 'building' && 'Building your application...'}
                    {step === 'optimizing' && 'Optimizing assets...'}
                    {step === 'uploading' && 'Deploying to edge...'}
                  </h3>
                  <p className="text-lovable-textMuted">This usually takes about 10-15 seconds</p>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center gap-2 mt-4">
                  <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step === 'building' || step === 'optimizing' || step === 'uploading' ? 'bg-krish-500' : 'bg-lovable-surfaceHighlight'}`} />
                  <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step === 'optimizing' || step === 'uploading' ? 'bg-krish-500' : 'bg-lovable-surfaceHighlight'}`} />
                  <div className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step === 'uploading' ? 'bg-krish-500' : 'bg-lovable-surfaceHighlight'}`} />
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center ring-1 ring-green-500/30 relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                  <Check className="w-10 h-10 text-green-500 relative z-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">You're Live!</h3>
                  <p className="text-lovable-textMuted mb-6">Your app has been successfully published to:</p>
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handleOpenLive(); }}
                      className="inline-block px-4 py-2 bg-black border border-lovable-border rounded-lg text-krish-400 hover:text-krish-300 transition-colors font-mono text-sm"
                    >
                      {deployedUrl}
                    </a>
                    <span className="text-[10px] text-lovable-textDim">(Opens in local simulation mode)</span>
                  </div>
                </div>
                <div className="flex gap-3 w-full">
                  <Button variant="secondary" className="flex-1" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={handleOpenLive}>
                    View Site <Globe size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            )
          ) : (
            // Export Tab Content
            <div className="space-y-4">
              <div 
                className="group p-4 bg-lovable-surfaceHighlight/50 hover:bg-lovable-surfaceHighlight border border-lovable-border rounded-xl cursor-pointer transition-all flex items-center justify-between"
                onClick={handleDownload}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <Download className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Download Source</h3>
                    <p className="text-xs text-lovable-textMuted">Get a standalone HTML file</p>
                  </div>
                </div>
                <Download size={16} className="text-lovable-textDim group-hover:text-white" />
              </div>

              <div 
                className="group p-4 bg-lovable-surfaceHighlight/50 hover:bg-lovable-surfaceHighlight border border-lovable-border rounded-xl cursor-pointer transition-all flex items-center justify-between"
                onClick={() => window.open('https://replit.com/new', '_blank')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center relative overflow-hidden">
                    {/* Replit-like styling */}
                    <div className="absolute inset-0 bg-orange-500/20"></div>
                    <Terminal className="text-orange-500 relative z-10" size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">Open in Replit</h3>
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-600 text-[9px] font-bold text-white rounded uppercase tracking-wide">
                        Pro
                      </span>
                    </div>
                    <p className="text-xs text-lovable-textMuted">Instant dev environment</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-lovable-textDim group-hover:text-white" />
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-200/80 leading-relaxed text-center">
                  Pro tip: You can also deploy directly to GitHub Pages or Netlify with the Pro plan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};