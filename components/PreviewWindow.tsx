import React, { useEffect, useState, useMemo } from 'react';
import { ViewMode } from '../types';
import { Button } from './Button';
import { Smartphone, Monitor, Tablet, RefreshCw, Download, AlertCircle, ExternalLink, Bug, Lock, RotateCw, Sparkles } from 'lucide-react';

interface PreviewWindowProps {
  code: string | null;
  version: number;
  projectName: string;
  onAutoFix?: (error: string) => void;
}

interface ErrorDetails {
  message: string;
  type?: string;
  line?: number;
  column?: number;
  stack?: string;
}

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ code, version, projectName, onAutoFix }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0); // Force re-render on code change
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setError(null);
    setIframeKey(prev => prev + 1);
    
    // Create a slug from the project name
    const slug = projectName
      ? projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'app';
      
    setUrl(`https://${slug}.krish.ai${version > 1 ? `/v${version}` : ''}`);
  }, [code, version, projectName]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_ERROR') {
        const rawError = event.data.error;
        // Handle both simple string messages (legacy) and new object structure
        if (typeof rawError === 'string') {
           setError({ message: rawError });
        } else {
           setError({
             message: rawError.message || 'Unknown Error',
             type: rawError.type,
             line: rawError.line,
             column: rawError.column,
             stack: rawError.stack
           });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const handleDownload = () => {
    if (!code) return;
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

  const handleReload = () => {
    setError(null);
    setIframeKey(prev => prev + 1);
  };

  const handleAutoFix = () => {
    if (error && onAutoFix) {
      onAutoFix(`I encountered this error in the preview: ${error.type}: ${error.message}. Please fix the code.`);
      setError(null); // Clear error while fixing
    }
  };

  const augmentedCode = useMemo(() => {
    if (!code) return '';
    // Inject enhanced error handling script at the beginning
    const errorScript = `
      <script>
        window.onerror = function(msg, url, lineNo, columnNo, error) {
          window.parent.postMessage({ 
            type: 'PREVIEW_ERROR', 
            error: {
              message: msg.toString(),
              type: error ? error.name : 'RuntimeError',
              line: lineNo,
              column: columnNo,
              stack: error ? error.stack : ''
            }
          }, '*');
          return false;
        };
        window.addEventListener('unhandledrejection', function(event) {
          window.parent.postMessage({ 
            type: 'PREVIEW_ERROR', 
            error: {
              message: event.reason ? event.reason.toString() : 'Unhandled Rejection',
              type: 'PromiseRejection',
              stack: event.reason ? event.reason.stack : ''
            }
          }, '*');
        });
        console.error = function(...args) {
          // Optional: We could stream console errors too
        };
      </script>
    `;
    return code.replace('<head>', '<head>' + errorScript);
  }, [code]);

  const getSuggestion = (err: ErrorDetails) => {
    const msg = err.message.toLowerCase();
    if (msg.includes('is not defined')) return "You might be trying to use a variable or function that hasn't been declared yet. Check for typos in variable names.";
    if (msg.includes('of undefined') || msg.includes('of null')) return "You are trying to access a property on an element that doesn't exist. Check if your state or props are initialized correctly.";
    if (msg.includes('minified react error')) return "A React error occurred. This often happens due to invalid hook usage, incorrect JSX nesting, or multiple React versions.";
    if (msg.includes('syntaxerror') || err.type === 'SyntaxError') return "There seems to be a syntax error in your code. Check for missing brackets, parentheses, or semicolons.";
    if (msg.includes('element type is invalid')) return "Check your imports and exports. You might be trying to render a component that doesn't exist or is imported incorrectly.";
    return "Try reviewing the recent code changes or ask the AI to fix this error.";
  };

  return (
    <div className="flex flex-col h-full w-full bg-lovable-surface rounded-xl overflow-hidden border border-lovable-border shadow-2xl relative">
      {/* Browser Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#18181b] border-b border-lovable-border z-10 h-12 gap-4">
        
        {/* Window Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl flex items-center bg-black/50 border border-white/5 rounded-md px-3 py-1.5 text-xs text-lovable-textMuted group focus-within:border-white/20 transition-colors">
          <Lock size={10} className="mr-2 text-green-500/80" />
          <span className="text-green-500/80 mr-1">https://</span>
          <input 
            type="text" 
            value={url} 
            readOnly 
            className="bg-transparent border-none outline-none w-full text-lovable-textDim group-hover:text-lovable-text transition-colors"
          />
          <RotateCw size={10} className="ml-2 cursor-pointer hover:text-white" onClick={handleReload} />
        </div>
        
        {/* Right Controls */}
        <div className="flex items-center gap-4 flex-shrink-0">
           {/* View Mode Toggle */}
           <div className="flex items-center bg-black/50 rounded-md p-0.5 border border-white/5">
              <button 
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded ${viewMode === 'desktop' ? 'bg-lovable-surfaceHighlight text-white' : 'text-lovable-textDim hover:text-white'}`}
                title="Desktop View"
              >
                <Monitor size={14} />
              </button>
              <button 
                onClick={() => setViewMode('tablet')}
                className={`p-1.5 rounded ${viewMode === 'tablet' ? 'bg-lovable-surfaceHighlight text-white' : 'text-lovable-textDim hover:text-white'}`}
                title="Tablet View"
              >
                <Tablet size={14} />
              </button>
              <button 
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded ${viewMode === 'mobile' ? 'bg-lovable-surfaceHighlight text-white' : 'text-lovable-textDim hover:text-white'}`}
                title="Mobile View"
              >
                <Smartphone size={14} />
              </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10"></div>

          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="text-lovable-textDim hover:text-white transition-colors" title="Download Code">
              <Download size={16} />
            </button>
            <button onClick={handleReload} className="text-lovable-textDim hover:text-white transition-colors" title="Reload Preview">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative bg-[#09090b] flex justify-center overflow-hidden">
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#18181b] border border-red-500/20 rounded-xl p-6 max-w-lg w-full shadow-2xl flex flex-col items-start text-left animate-slide-up ring-1 ring-white/5">
              
              <div className="flex items-center gap-3 mb-5 w-full border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center ring-1 ring-red-500/20 flex-shrink-0">
                  <Bug className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    {error.type || 'Runtime Error'}
                  </h3>
                  {error.line && (
                    <p className="text-xs text-red-300/80 font-mono mt-0.5">
                      at line {error.line}, column {error.column}
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full bg-red-950/10 border border-red-500/10 rounded-lg p-3 mb-5 overflow-auto max-h-40 relative group">
                <code className="text-red-200 text-xs font-mono break-words whitespace-pre-wrap block leading-relaxed">
                  {error.message}
                </code>
              </div>

              <div className="w-full bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 mb-6">
                <h4 className="text-xs font-semibold text-blue-400 mb-1.5 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  Possible Fix
                </h4>
                <p className="text-xs text-blue-200/70 leading-relaxed">
                  {getSuggestion(error)}
                </p>
              </div>

              <div className="flex w-full gap-3">
                {onAutoFix && (
                  <Button onClick={handleAutoFix} variant="primary" size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-none font-semibold">
                    <Sparkles size={14} className="mr-2" />
                    Auto Fix with AI
                  </Button>
                )}
                 <Button onClick={handleReload} variant="secondary" size="sm" className="flex-1 bg-white hover:bg-gray-200 text-black border-none font-semibold">
                  <RefreshCw size={14} className="mr-2" />
                  Reload
                </Button>
                <Button onClick={() => setError(null)} variant="ghost" size="sm" className="flex-0.5 border-white/10 hover:bg-white/5">
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {!code ? (
          <div className="flex flex-col items-center justify-center h-full text-lovable-textDim">
            <div className="w-12 h-12 rounded-xl bg-lovable-surface border border-lovable-border flex items-center justify-center mb-4">
              <Monitor size={24} className="opacity-50" />
            </div>
            <p className="text-sm">Preview</p>
          </div>
        ) : (
          <div 
            className="h-full transition-all duration-300 ease-in-out bg-white shadow-2xl mx-auto"
            style={{ 
              width: getWidth(), 
              borderLeft: viewMode !== 'desktop' ? '1px solid #333' : 'none',
              borderRight: viewMode !== 'desktop' ? '1px solid #333' : 'none',
            }}
          >
            <iframe
              key={iframeKey}
              title="App Preview"
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