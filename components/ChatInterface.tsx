import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Button } from './Button';
import { Send, Sparkles, ArrowUp, Layout, ListTodo, BarChart3, Image as ImageIcon, Paperclip, Mic, X } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, image?: string) => void;
  isGenerating: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isGenerating 
}) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isGenerating) return;
    
    onSendMessage(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.start();
    } else {
      alert('Voice input is not supported in this browser.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scroll-smooth pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] -mt-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 flex items-center justify-center mb-6 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              What can I build for you?
            </h2>
            <p className="text-lovable-textMuted max-w-lg mx-auto text-lg leading-relaxed mb-10">
              I'm <span className="text-indigo-400 font-semibold">Krish AI</span>. I can generate full-stack React apps, landing pages, and tools in seconds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {[
                { icon: <Layout size={18} />, text: "Landing page for a startup" },
                { icon: <ListTodo size={18} />, text: "Kanban board with dnd" },
                { icon: <BarChart3 size={18} />, text: "Analytics dashboard" },
                { icon: <ImageIcon size={18} />, text: "Portfolio with gallery" }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setInput(item.text)}
                  className="flex items-center gap-3 p-4 text-left bg-lovable-surface hover:bg-lovable-surfaceHighlight border border-lovable-border hover:border-indigo-500/50 rounded-xl transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-black/50 text-lovable-textDim group-hover:text-indigo-400 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-lovable-text group-hover:text-white">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-center mb-2 space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <span className="text-xs font-medium text-lovable-textDim uppercase tracking-wider">
                {msg.role === 'user' ? 'You' : 'Krish AI'}
              </span>
            </div>
            
            <div 
              className={`max-w-[90%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-lovable-surface text-white border border-lovable-border' 
                  : 'bg-transparent text-lovable-text pl-0'
              }`}
            >
              {msg.attachment && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                  <img src={msg.attachment} alt="User attachment" className="max-w-full max-h-60 object-cover" />
                </div>
              )}
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <div className="space-y-2">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex flex-col items-start space-y-2">
            <span className="text-xs font-medium text-lovable-textDim uppercase tracking-wider">Krish AI</span>
            <div className="flex items-center space-x-2 pl-0">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Floating */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent pt-10">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
          
          <form onSubmit={handleSubmit} className="relative bg-lovable-surface rounded-2xl border border-lovable-border shadow-2xl overflow-hidden">
            
            {/* Image Preview */}
            {selectedImage && (
              <div className="px-4 pt-4 pb-2 flex items-start">
                <div className="relative group/image">
                  <img src={selectedImage} alt="Selected" className="h-16 w-16 object-cover rounded-lg border border-white/10" />
                  <button 
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/image:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={selectedImage ? "Describe what to change or build from this image..." : "Describe your dream app..."}
              className="w-full bg-transparent text-white placeholder-lovable-textDim rounded-2xl pl-4 pr-32 py-4 focus:outline-none resize-none max-h-48 overflow-y-auto min-h-[56px]"
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {/* Attachment Button */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-lovable-textDim hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Upload Image"
              >
                <Paperclip size={18} />
              </button>

              {/* Voice Button */}
              <button 
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2 rounded-xl transition-colors ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-lovable-textDim hover:text-white hover:bg-white/10'}`}
                title="Voice Input"
              >
                <Mic size={18} />
              </button>

              {/* Send Button */}
              <button 
                type="submit" 
                disabled={(!input.trim() && !selectedImage) || isGenerating}
                className="p-2 bg-white text-black rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowUp size={18} strokeWidth={3} />
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-lovable-textDim mt-2">
            Free Pro Features: Vision-to-Code & Voice Input enabled.
          </p>
        </div>
      </div>
    </div>
  );
};