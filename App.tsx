
import React, { useState, useEffect, useMemo } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { PreviewWindow } from './components/PreviewWindow';
import { CodeEditor } from './components/CodeEditor';
import { PublishModal } from './components/PublishModal';
import { InfoModal } from './components/InfoModals';
import { FileExplorer } from './components/FileExplorer';
import { AuthPage } from './components/AuthPage';
import { TermsModal } from './components/TermsModal';
import { Message, GeneratedApp, Project, VirtualFile, Collaborator } from './types';
import { generateAppCode } from './services/geminiService';
import { saveProjects, loadProjects, createNewProject } from './utils/storage';
import { splitCode, mergeCode } from './utils/fileHelpers';
import { collaborationService } from './services/collaborationService';
import { Code, Zap, Rocket, Plus, Menu, Trash2, Edit2, Columns, Maximize2, LogOut, Sparkles, Terminal, Wifi, Command, Settings } from 'lucide-react';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function App() {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('tab');
  const [activeFile, setActiveFile] = useState<string>('index.html');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUser] = useState(collaborationService.getUserInfo());

  const [infoModalType, setInfoModalType] = useState<'about' | 'team' | 'policy' | null>(null);

  const currentProject = useMemo(() => 
    projects.find(p => p.id === currentProjectId) || null
  , [projects, currentProjectId]);

  const virtualFiles = useMemo(() => 
    currentProject?.currentCode ? splitCode(currentProject.currentCode) : []
  , [currentProject?.currentCode]);

  const activeFileContent = useMemo(() => 
    virtualFiles.find(f => f.name === activeFile)?.content || ''
  , [virtualFiles, activeFile]);

  useEffect(() => {
    const termsAccepted = localStorage.getItem('krish_ai_terms_accepted');
    if (termsAccepted === 'true') setHasAcceptedTerms(true);

    const auth = localStorage.getItem('krish_ai_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const loaded = loadProjects();
    if (loaded.length > 0) {
      setProjects(loaded);
      setCurrentProjectId(loaded[0].id);
    } else {
      handleNewProject();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      collaborationService.join();
      const unsubscribe = collaborationService.subscribe((msg) => {
        if (msg.type === 'CODE_UPDATE') {
          const { projectId, fileName, newCode } = msg.payload;
          setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
              const merged = mergeCode(p.currentCode, fileName, newCode);
              return { ...p, currentCode: merged, updatedAt: Date.now() };
            }
            return p;
          }));
        } else if (msg.type === 'JOIN' || msg.type === 'HEARTBEAT' || msg.type === 'CURSOR_MOVE') {
          setCollaborators(prev => {
            const exists = prev.find(c => c.id === msg.senderId);
            const payload = msg.type === 'CURSOR_MOVE' ? { ...msg.payload, lastActive: Date.now() } : { ...msg.payload, lastActive: Date.now() };
            if (exists) {
              return prev.map(c => c.id === msg.senderId ? payload : c);
            }
            return [...prev, payload];
          });
        } else if (msg.type === 'LEAVE') {
          setCollaborators(prev => prev.filter(c => c.id !== msg.senderId));
        }
      });

      const interval = setInterval(() => {
        const now = Date.now();
        setCollaborators(prev => prev.filter(c => now - c.lastActive < 10000));
      }, 5000);

      return () => {
        unsubscribe();
        clearInterval(interval);
        collaborationService.leave();
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (projects.length > 0) saveProjects(projects);
  }, [projects]);

  const handleNewProject = () => {
    const newProject = createNewProject();
    setProjects(prev => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setActiveTab('preview');
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    if (currentProjectId === id) {
      newProjects.length > 0 ? setCurrentProjectId(newProjects[0].id) : handleNewProject();
    }
  };

  const handleSendMessage = async (content: string, imageBase64?: string) => {
    if (!currentProject) return;
    const userMsg: Message = { role: 'user', content, timestamp: Date.now(), attachment: imageBase64 };
    const updatedProject = { ...currentProject, messages: [...currentProject.messages, userMsg] };
    
    setProjects(prev => prev.map(p => p.id === currentProjectId ? updatedProject : p));
    setIsGenerating(true);

    try {
      const result = await generateAppCode(content, currentProject.currentCode || null, imageBase64);
      const newHistoryItem: GeneratedApp = {
        html: result.html, explanation: result.explanation, timestamp: Date.now(), version: currentProject.history.length + 1
      };
      const assistantMsg: Message = { role: 'assistant', content: result.explanation, timestamp: Date.now() };

      let newName = currentProject.name;
      if (currentProject.messages.length === 0) newName = content.split(' ').slice(0, 4).join(' ') + '...';

      setProjects(prev => prev.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p, name: newName !== 'Untitled Project' ? newName : p.name,
            currentCode: result.html, messages: [...p.messages, userMsg, assistantMsg],
            history: [...p.history, newHistoryItem], updatedAt: Date.now()
          };
        }
        return p;
      }));
      if (currentProjectId) collaborationService.syncCode(currentProjectId, 'index.html', result.html);

    } catch (error) {
       const errorMsg: Message = { role: 'assistant', content: "I encountered an error. Please try again.", timestamp: Date.now() };
       setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, messages: [...p.messages, errorMsg] } : p));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeChange = (newContent: string | undefined) => {
    if (newContent === undefined || !currentProject) return;
    if (newContent !== activeFileContent) {
      const mergedHtml = mergeCode(currentProject.currentCode, activeFile, newContent);
      setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, currentCode: mergedHtml, updatedAt: Date.now() } : p));
      collaborationService.syncCode(currentProjectId!, activeFile, newContent);
    }
  };

  const handleRename = () => {
    if (!currentProject) return;
    setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, name: renameValue } : p));
    setIsRenaming(false);
  };

  const handleAutoFix = (error: string) => {
    handleSendMessage(error);
  };

  if (!hasAcceptedTerms) return <TermsModal onAccept={() => { localStorage.setItem('krish_ai_terms_accepted', 'true'); setHasAcceptedTerms(true); }} />;
  if (!isAuthenticated) return <AuthPage onLogin={() => { localStorage.setItem('krish_ai_auth', 'true'); setIsAuthenticated(true); }} />;

  return (
    <div className="flex h-screen bg-[#030305] text-[#e4e4e7] font-sans overflow-hidden">
      
      {/* Sidebar - Glass Effect */}
      <div className={`${showSidebar ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full opacity-0'} transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col border-r border-white/5 bg-[#09090b]/80 backdrop-blur-xl z-30 relative`}>
        {/* Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide text-white">Krish AI</span>
          </div>
          <button onClick={() => handleNewProject()} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white" title="New Project">
            <Plus size={18} />
          </button>
        </div>
        
        {/* Projects List */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="px-3 mb-4 flex items-center justify-between">
             <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Workspace</div>
          </div>
          <div className="space-y-1 mb-8">
            {projects.map(p => (
              <div 
                key={p.id}
                onClick={() => { setCurrentProjectId(p.id); setActiveTab('preview'); }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border border-transparent ${
                  p.id === currentProjectId 
                    ? 'bg-white/5 text-white border-white/5 shadow-sm' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1 mr-2">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="truncate text-[10px] opacity-40 font-mono mt-0.5">{timeAgo(p.updatedAt)}</span>
                </div>
                {p.id === currentProjectId && (
                  <button onClick={(e) => handleDeleteProject(e, p.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-md hover:text-red-400 transition-all">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {currentProject && currentProject.currentCode && (
            <div className="pt-6 border-t border-white/5">
               <div className="px-3 mb-3 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Project Files</div>
               </div>
               <FileExplorer 
                  files={virtualFiles} 
                  activeFile={activeTab === 'code' ? activeFile : null}
                  onFileSelect={(fileName) => { setActiveFile(fileName); setActiveTab('code'); }}
               />
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              K
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-white truncate">Pro Plan</div>
              <div className="text-[10px] text-white/40 truncate">krish@example.com</div>
            </div>
            <Settings size={14} className="text-white/40" />
          </div>
          
          <div className="flex items-center justify-between px-1">
             <div className="flex gap-4">
                <button onClick={() => setInfoModalType('about')} className="text-[10px] text-white/40 hover:text-white transition-colors">About</button>
                <button onClick={() => setInfoModalType('policy')} className="text-[10px] text-white/40 hover:text-white transition-colors">Privacy</button>
             </div>
             <button onClick={() => { localStorage.removeItem('krish_ai_auth'); setIsAuthenticated(false); }} className="text-white/40 hover:text-white transition-colors">
               <LogOut size={14} />
             </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative bg-[#030305]">
        {/* Workspace Toolbar */}
        {currentProject && (
           <header className="h-16 border-b border-white/5 bg-[#030305]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowSidebar(!showSidebar)} className="text-white/40 hover:text-white transition-colors md:hidden">
                  <Menu size={20} />
                </button>
                {isRenaming ? (
                  <input 
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 w-48"
                    autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRename} onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  />
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setIsRenaming(true); setRenameValue(currentProject.name); }}>
                    <h1 className="font-semibold text-white/90 text-sm">{currentProject.name}</h1>
                    <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-white/40 transition-opacity" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                 {/* Tab Switcher */}
                 <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/5">
                    <button 
                      onClick={() => { setActiveTab('preview'); setViewMode('tab'); }}
                      className={`flex items-center px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'preview' && viewMode === 'tab' ? 'bg-[#18181b] text-white shadow-sm border border-white/10' : 'text-white/40 hover:text-white'}`}
                    >
                      <Zap size={12} className="mr-2" /> Preview
                    </button>
                    <button 
                      onClick={() => { setActiveTab('code'); setViewMode('tab'); }}
                      className={`flex items-center px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'code' && viewMode === 'tab' ? 'bg-[#18181b] text-white shadow-sm border border-white/10' : 'text-white/40 hover:text-white'}`}
                    >
                      <Code size={12} className="mr-2" /> Code
                    </button>
                 </div>

                 {/* Split View Toggle */}
                 <button onClick={() => setViewMode(viewMode === 'split' ? 'tab' : 'split')} className={`p-2 rounded-lg border transition-all hidden md:flex ${viewMode === 'split' ? 'bg-white/10 text-white border-white/10' : 'text-white/40 hover:text-white border-transparent'}`}>
                    {viewMode === 'split' ? <Maximize2 size={16} /> : <Columns size={16} />}
                 </button>

                 <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

                 {/* Actions */}
                 <div className="flex items-center gap-3">
                    <button onClick={() => window.open('https://replit.com/new', '_blank')} className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-medium px-3 py-2 hover:bg-white/5 rounded-lg">
                      <Terminal size={14} className="text-orange-500" /> Replit
                    </button>
                    <button onClick={() => setIsPublishModalOpen(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      <Rocket size={14} /> Publish
                    </button>
                 </div>
              </div>
           </header>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel - Integrated Glass Look */}
          <div className="w-full md:w-[420px] flex flex-col border-r border-white/5 bg-[#030305] z-10">
             {currentProject ? (
               <ChatInterface messages={currentProject.messages} onSendMessage={handleSendMessage} isGenerating={isGenerating} />
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-white/40 p-10 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                     <Command className="w-10 h-10 opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Ready to create?</h3>
                  <p className="text-sm max-w-xs mb-8">Select a project from the sidebar to start coding with Krish AI.</p>
                  <button onClick={handleNewProject} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">Create New Project</button>
               </div>
             )}
          </div>

          {/* Right Panel: Preview & Code */}
          <div className="flex-1 flex flex-col h-full relative bg-[#050507]">
             {currentProject && (
               <>
                 <div className={`h-full flex flex-col transition-all duration-500 ${viewMode === 'split' ? 'w-1/2 relative border-r border-white/5' : 'absolute inset-0'} ${viewMode === 'tab' && activeTab !== 'preview' ? 'opacity-0 z-0 pointer-events-none' : 'opacity-100 z-10'}`}>
                    <div className="h-full p-6 flex items-center justify-center bg-[#050507]">
                      <PreviewWindow code={currentProject.currentCode} version={currentProject.history.length} projectName={currentProject.name} onAutoFix={handleAutoFix} />
                    </div>
                 </div>

                 <div className={`h-full flex flex-col bg-[#0e0e11] ${viewMode === 'split' ? 'w-1/2 relative' : 'absolute inset-0'} ${viewMode === 'tab' && activeTab !== 'code' ? 'opacity-0 z-0 pointer-events-none' : 'opacity-100 z-10'}`}>
                    <div className="flex items-center bg-[#0e0e11] border-b border-white/5 overflow-x-auto no-scrollbar">
                      {virtualFiles.map(file => (
                        <div key={file.name} onClick={() => setActiveFile(file.name)} className={`flex items-center px-5 py-3 text-xs font-medium cursor-pointer border-r border-white/5 transition-colors ${activeFile === file.name ? 'bg-[#18181b] text-white border-t-2 border-t-indigo-500' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                          <span className={`mr-2 ${file.name.endsWith('css') ? 'text-blue-400' : 'text-yellow-400'}`}>#</span> {file.name}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 relative">
                      <CodeEditor code={activeFileContent} onChange={handleCodeChange} collaborators={collaborators.filter(c => c.id !== currentUser.id && c.file === activeFile)} onCursorChange={(pos) => collaborationService.syncCursor(activeFile, pos)} />
                    </div>
                 </div>
               </>
             )}
          </div>
        </div>
      </main>

      <PublishModal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} code={currentProject?.currentCode || ''} />
      <InfoModal isOpen={!!infoModalType} type={infoModalType} onClose={() => setInfoModalType(null)} />
    </div>
  );
}
