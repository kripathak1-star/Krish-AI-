
import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Button } from './Button';
import { Send, Sparkles, ArrowUp, Layout, ListTodo, BarChart3, Image as ImageIcon, Paperclip, Mic, X, Loader2, Zap } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, image?: string) => void;
  isGenerating: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isGenerating }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, generationStep]);

  useEffect(() => {
    if (isGenerating) {
      setGenerationStep('Analyzing requirements...');
      const steps = [
        { t: 1000, msg: 'Designing architecture...' },
        { t: 2500, msg: 'Writing React components...' },
        { t: 4000, msg: 'Polishing Tailwind styles...' },
        { t: 5500, msg: 'Finalizing build...' }
      ];
      const timeouts = steps.map(s => setTimeout(() => setGenerationStep(s.msg), s.t));
      return () => timeouts.forEach(clearTimeout);
    } else {
      setGenerationStep('');
    }
  }, [isGenerating]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isGenerating) return;
    onSendMessage(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030305] relative font-sans">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 scroll-smooth pb-36 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            <div className="relative mb-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-20 h-20 rounded-full bg-[#0E0E11] border border-white/10 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Build anything, instantly.
            </h2>
            <p className="text-white/40 max-w-sm mx-auto text-base mb-10 leading-relaxed">
              Describe your dream app, and I'll write the code, style it, and preview it for you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {[
                { icon: <Layout size={16} />, text: "Landing page for SaaS" },
                { icon: <ListTodo size={16} />, text: "Todo app with drag & drop" },
                { icon: <BarChart3 size={16} />, text: "Crypto dashboard" },
                { icon: <ImageIcon size={16} />, text: "Photo gallery portfolio" }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setInput(item.text)}
                  className="flex items-center gap-3 p-3 text-left bg-[#0E0E11] hover:bg-[#18181B] border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200 group"
                >
                  <div className="p-1.5 rounded-lg bg-white/5 text-white/40 group-hover:text-indigo-400 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-white/70 group-hover:text-white">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}>
            <div className={`flex items-center mb-2 space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                {msg.role === 'user' ? 'You' : 'Krish AI'}
              </span>
            </div>
            
            <div className={`max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-[#18181B] text-white border border-white/5 rounded-tr-sm' 
                  : 'bg-transparent text-white/80 pl-0'
              }`}
            >
              {msg.attachment && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                  <img src={msg.attachment} alt="Attachment" className="max-w-full max-h-60 object-cover" />
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex flex-col items-start space-y-3 animate-slide-up">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={10} className="text-indigo-400" />
              Generating
            </span>
            <div className="bg-[#0E0E11] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg max-w-xs">
               <Loader2 size={14} className="text-indigo-400 animate-spin" />
               <span className="text-xs text-white/70 font-mono">{generationStep}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Floating Command Center */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#030305] via-[#030305] to-transparent pt-12 z-20">
        <div className="relative group max-w-2xl mx-auto">
          {/* Glowing border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-blue-500/30 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          <form onSubmit={handleSubmit} className="relative bg-[#0E0E11] rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all flex flex-col">
            
            {selectedImage && (
              <div className="px-4 pt-4 pb-0 flex items-start animate-fade-in">
                <div className="relative group/image">
                  <img src={selectedImage} alt="Selected" className="h-12 w-12 object-cover rounded-md border border-white/10" />
                  <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity shadow-sm">
                    <X size={10} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end p-2 gap-2">
               <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder={selectedImage ? "Describe changes..." : "Describe the app you want to build..."}
                className="w-full bg-transparent text-white placeholder-white/20 rounded-xl px-3 py-3 focus:outline-none resize-none max-h-48 overflow-y-auto min-h-[48px] text-sm leading-relaxed"
                rows={1}
              />

              <div className="flex items-center gap-1 pb-1 pr-1">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Upload Image">
                  <Paperclip size={16} />
                </button>
                <button 
                  type="submit" 
                  disabled={(!input.trim() && !selectedImage) || isGenerating}
                  className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                >
                  <ArrowUp size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          </form>
          <div className="mt-2 text-center">
             <span className="text-[10px] text-white/20 font-medium tracking-wide">POWERED BY GEMINI 2.0 FLASH</span>
          </div>
        </div>
      </div>
    </div>
  );
};
