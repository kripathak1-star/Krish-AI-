
import React, { useEffect, useState, useMemo } from 'react';
import { ViewMode } from '../types';
import { Button } from './Button';
import { Smartphone, Monitor, Tablet, RefreshCw, Download, Lock, RotateCw, Bug, Sparkles, XCircle, AlertTriangle } from 'lucide-react';

interface PreviewWindowProps {
  code: string | null;
  version: number;
  projectName: string;
  onAutoFix?: (error: string) => void;
}

interface ErrorDetails { message: string; type?: string; line?: number; column?: number; stack?: string; }

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ code, version, projectName, onAutoFix }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setError(null);
    setIframeKey(prev => prev + 1);
    const slug = projectName ? projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-') : 'app';
    setUrl(`https://${slug}.krish.ai/v${version}`);
  }, [code, version, projectName]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_ERROR') {
        const raw = event.data.error;
        setError(typeof raw === 'string' ? { message: raw } : raw);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const augmentedCode = useMemo(() => {
    if (!code) return '';
    return code.replace('<head>', `<head><script>
      window.onerror = function(msg, url, line, col, error) {
        window.parent.postMessage({ type: 'PREVIEW_ERROR', error: { message: msg, type: error?.name, line, column: col } }, '*');
      };
    </script>`);
  }, [code]);

  const getDebugTips = (err: ErrorDetails) => {
    if (err.message.includes('is not defined')) return "Check variable spelling or imports. If using a third-party library, make sure it's loaded.";
    if (err.message.includes('Minified React error')) return "A React internal error occurred. Check your JSX structure or hooks usage.";
    if (err.type === 'SyntaxError') return "Look for missing braces }, parentheses ), or closing tags </>.";
    if (err.type === 'TypeError' && err.message.includes('null')) return "You are trying to access a property on a null value. Check if your state or ref is initialized.";
    if (err.message.includes('Element type is invalid')) return "Check your imports. You might be importing a default export as a named export or vice versa.";
    return "Try reviewing the code around the reported line number. The AI can often spot the issue automatically.";
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0E0E11] rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative ring-1 ring-black/50">
      {/* Browser Toolbar - Sleek Dark Mode */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#18181B] border-b border-white/5 gap-4">
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-transparent shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-transparent shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-transparent shadow-sm"></div>
        </div>

        <div className="flex-1 max-w-xl flex items-center bg-[#09090B] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white/40 group hover:border-white/10 transition-colors shadow-inner">
          <Lock size={10} className="mr-2 text-emerald-500" />
          <span className="text-white/20 mr-1 select-none">https://</span>
          <input type="text" value={url} readOnly className="bg-transparent border-none outline-none w-full text-white/60 font-mono" />
          <RotateCw size={10} className="ml-2 cursor-pointer hover:text-white transition-colors" onClick={() => setIframeKey(p => p + 1)} />
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex bg-[#09090B] rounded-lg p-0.5 border border-white/5">
              {['desktop', 'tablet', 'mobile'].map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setViewMode(mode as ViewMode)}
                  className={`p-1.5 rounded-md transition-all ${viewMode === mode ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white'}`}
                >
                  {mode === 'desktop' && <Monitor size={14} />}
                  {mode === 'tablet' && <Tablet size={14} />}
                  {mode === 'mobile' && <Smartphone size={14} />}
                </button>
              ))}
          </div>
          <button onClick={() => {}} className="text-white/30 hover:text-white transition-colors"><Download size={16} /></button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#09090B] flex justify-center overflow-hidden w-full h-full">
        {error && (
          <div className="absolute top-4 right-4 z-50 animate-slide-up max-w-md w-full px-4">
            <div className="bg-[#18181B] border border-red-500/20 rounded-xl p-4 shadow-2xl flex flex-col gap-3 backdrop-blur-md ring-1 ring-red-500/10">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-sm border-b border-red-500/10 pb-2">
                <AlertTriangle size={16} />
                <span>{error.type || 'Runtime Error'}</span>
                {(error.line !== undefined && error.line > 0) && (
                   <span className="text-xs text-white/40 font-mono ml-auto px-2 py-0.5 bg-white/5 rounded">Ln {error.line}, Col {error.column}</span>
                )}
                <button onClick={() => setError(null)} className="ml-2 text-white/20 hover:text-white transition-colors">
                  <XCircle size={14} />
                </button>
              </div>
              
              <div className="text-xs text-white/80 font-mono break-words bg-red-500/5 p-3 rounded border border-red-500/10 leading-relaxed border-l-2 border-l-red-500">
                {error.message}
              </div>

              {/* Smart Debugging Tips */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <Bug size={12} className="text-indigo-400" />
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Debugging Tip</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                   {getDebugTips(error)}
                </p>
              </div>

              {onAutoFix && (
                <Button 
                  onClick={() => { onAutoFix(`Fix this error: ${error.message}. Error Type: ${error.type}. Line: ${error.line}`); setError(null); }} 
                  variant="primary" 
                  size="sm" 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 border-none text-white shadow-lg shadow-indigo-500/20 mt-1"
                >
                  <Sparkles size={12} className="mr-2" /> Auto Fix with AI
                </Button>
              )}
            </div>
          </div>
        )}

        {!code ? (
          <div className="flex flex-col items-center justify-center h-full text-white/20">
             <div className="w-16 h-16 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center mb-4">
               <Monitor size={24} />
             </div>
             <p className="text-sm font-medium">App Preview</p>
          </div>
        ) : (
          <div 
            className="h-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] bg-white shadow-2xl mx-auto border-x border-[#333]"
            style={{ width: viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%' }}
          >
            <iframe
              key={iframeKey}
              title="Preview"
              srcDoc={augmentedCode}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
            />
          </div>
        )}
      </div>
    </div>
  );
};
