
import React, { useState, useEffect, useMemo } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { PreviewWindow } from './components/PreviewWindow';
import { CodeEditor } from './components/CodeEditor';
import { PublishModal } from './components/PublishModal';
import { InfoModal } from './components/InfoModals';
import { FileExplorer } from './components/FileExplorer';
import { AuthPage } from './components/AuthPage';
import { Message, GeneratedApp, Project, VirtualFile, Collaborator } from './types';
import { generateAppCode } from './services/geminiService';
import { saveProjects, loadProjects, createNewProject } from './utils/storage';
import { splitCode, mergeCode } from './utils/fileHelpers';
import { collaborationService } from './services/collaborationService';
import { Code, Layers, Zap, Rocket, Plus, History, Menu, Trash2, Edit2, ChevronLeft, Layout, Box, LogOut, Sparkles, Terminal, Columns, Maximize2, Users, Wifi } from 'lucide-react';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  
  return "just now";
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  // Navigation State
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewMode, setViewMode] = useState<'split' | 'tab'>('tab');
  const [activeFile, setActiveFile] = useState<string>('index.html');
  
  // App Logic State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  
  // Collaboration State
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentUser] = useState(collaborationService.getUserInfo());

  // Info Modals State
  const [infoModalType, setInfoModalType] = useState<'about' | 'team' | 'policy' | null>(null);

  // Derived State
  const currentProject = useMemo(() => 
    projects.find(p => p.id === currentProjectId) || null
  , [projects, currentProjectId]);

  const virtualFiles = useMemo(() => 
    currentProject?.currentCode ? splitCode(currentProject.currentCode) : []
  , [currentProject?.currentCode]);

  const activeFileContent = useMemo(() => 
    virtualFiles.find(f => f.name === activeFile)?.content || ''
  , [virtualFiles, activeFile]);

  // Init & Auth Check
  useEffect(() => {
    // Check auth
    const auth = localStorage.getItem('krish_ai_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    // Load projects
    const loaded = loadProjects();
    if (loaded.length > 0) {
      setProjects(loaded);
      setCurrentProjectId(loaded[0].id);
    } else {
      handleNewProject();
    }
  }, []);

  // Initialize Collaboration Service
  useEffect(() => {
    if (isAuthenticated) {
      collaborationService.join();

      const unsubscribe = collaborationService.subscribe((msg) => {
        if (msg.type === 'CODE_UPDATE') {
          // If we receive a code update for the current project, update it
          // Note: In a real app we'd use Operational Transformation or CRDTs to merge
          const { projectId, fileName, newCode } = msg.payload;
          
          setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
              // Merge the specific file update
              const merged = mergeCode(p.currentCode, fileName, newCode);
              return { ...p, currentCode: merged, updatedAt: Date.now() };
            }
            return p;
          }));
        }
        else if (msg.type === 'JOIN' || msg.type === 'HEARTBEAT') {
          setCollaborators(prev => {
            const exists = prev.find(c => c.id === msg.senderId);
            if (exists) {
              return prev.map(c => c.id === msg.senderId ? { ...msg.payload, lastActive: Date.now() } : c);
            }
            return [...prev, { ...msg.payload, lastActive: Date.now() }];
          });
        }
        else if (msg.type === 'LEAVE') {
          setCollaborators(prev => prev.filter(c => c.id !== msg.senderId));
        }
        else if (msg.type === 'CURSOR_MOVE') {
          setCollaborators(prev => prev.map(c => 
            c.id === msg.senderId ? { ...c, ...msg.payload, lastActive: Date.now() } : c
          ));
        }
      });

      // Cleanup inactive users
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

  // Auto-save
  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
    }
  }, [projects]);

  const handleLogin = () => {
    localStorage.setItem('krish_ai_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('krish_ai_auth');
    setIsAuthenticated(false);
  };

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
      if (newProjects.length > 0) {
        setCurrentProjectId(newProjects[0].id);
      } else {
        handleNewProject(); // Ensure at least one project exists
      }
    }
  };

  const handleSendMessage = async (content: string, imageBase64?: string) => {
    if (!currentProject) return;

    // Optimistic update for UI
    const userMsg: Message = { 
      role: 'user', 
      content, 
      timestamp: Date.now(),
      attachment: imageBase64 
    };
    
    const updatedProject = {
      ...currentProject,
      messages: [...currentProject.messages, userMsg]
    };
    
    setProjects(prev => prev.map(p => p.id === currentProjectId ? updatedProject : p));
    setIsGenerating(true);

    try {
      const result = await generateAppCode(content, currentProject.currentCode || null, imageBase64);
      
      const newHistoryItem: GeneratedApp = {
        html: result.html,
        explanation: result.explanation,
        timestamp: Date.now(),
        version: currentProject.history.length + 1
      };

      const assistantMsg: Message = {
        role: 'assistant',
        content: result.explanation,
        timestamp: Date.now()
      };

      // Generate a project name if it's the first prompt
      let newName = currentProject.name;
      if (currentProject.messages.length === 0) {
         // Simple heuristic: Use first few words
         newName = content.split(' ').slice(0, 4).join(' ') + '...';
      }

      setProjects(prev => {
        const updated = prev.map(p => {
          if (p.id === currentProjectId) {
            return {
              ...p,
              name: newName !== 'Untitled Project' ? newName : p.name,
              currentCode: result.html,
              messages: [...p.messages, userMsg, assistantMsg], // Add both to ensure consistency
              history: [...p.history, newHistoryItem],
              updatedAt: Date.now()
            };
          }
          return p;
        });
        
        // Notify collaboration service of code update
        if (currentProjectId) {
           collaborationService.syncCode(currentProjectId, 'index.html', result.html);
        }
        return updated;
      });

    } catch (error) {
       const errorMsg: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while generating your app. Please try again.",
        timestamp: Date.now()
      };
      setProjects(prev => prev.map(p => p.id === currentProjectId ? {
        ...p,
        messages: [...p.messages, errorMsg]
      } : p));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeChange = (newContent: string | undefined) => {
    if (newContent === undefined || !currentProject) return;
    
    // Only update if content is different to prevent loops
    if (newContent !== activeFileContent) {
      const mergedHtml = mergeCode(currentProject.currentCode, activeFile, newContent);
      
      setProjects(prev => prev.map(p => p.id === currentProjectId ? {
        ...p,
        currentCode: mergedHtml,
        updatedAt: Date.now()
      } : p));
      
      // Broadcast change
      collaborationService.syncCode(currentProjectId!, activeFile, newContent);
    }
  };
  
  const handleCursorChange = (position: { lineNumber: number; column: number }) => {
    collaborationService.syncCursor(activeFile, position);
  };

  const handleRename = () => {
    if (!currentProject) return;
    setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, name: renameValue } : p));
    setIsRenaming(false);
  };

  const handleAutoFix = (errorDescription: string) => {
    handleSendMessage(errorDescription);
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-lovable-bg text-lovable-text font-sans overflow-hidden">
      
      {/* Sidebar - Minimalist Lovable Style */}
      <div 
        className={`${showSidebar ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full opacity-0'} transition-all duration-300 md:translate-x-0 md:opacity-100 absolute md:relative z-30 h-full flex flex-col border-r border-lovable-border bg-lovable-sidebar`}
      >
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-lovable-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white w-3.5 h-3.5" strokeWidth={3} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">Krish AI</span>
          </div>
          <button onClick={() => handleNewProject()} className="p-1.5 hover:bg-lovable-surface rounded-md transition-colors text-lovable-textMuted hover:text-white" title="New Project">
            <Plus size={16} />
          </button>
        </div>
        
        {/* Projects List */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-3 flex items-center justify-between">
             <div className="text-[10px] font-bold text-lovable-textDim uppercase tracking-wider">Recent Projects</div>
          </div>
          <div className="px-2 space-y-0.5 mb-6">
            {projects.map(p => (
              <div 
                key={p.id}
                onClick={() => { setCurrentProjectId(p.id); setActiveTab('preview'); }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all ${
                  p.id === currentProjectId 
                    ? 'bg-lovable-surface text-white' 
                    : 'text-lovable-textMuted hover:text-white hover:bg-lovable-surface/50'
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1 mr-2">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="truncate text-[10px] opacity-50">{timeAgo(p.updatedAt)}</span>
                </div>
                {p.id === currentProjectId && (
                  <button 
                    onClick={(e) => handleDeleteProject(e, p.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* File Explorer (Only visible for current project) */}
          {currentProject && currentProject.currentCode && (
            <div className="pt-4 border-t border-lovable-border/50">
               <div className="px-4 mb-2 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-lovable-textDim uppercase tracking-wider">Files</div>
               </div>
               <FileExplorer 
                  files={virtualFiles} 
                  activeFile={activeTab === 'code' ? activeFile : null}
                  onFileSelect={(fileName) => {
                    setActiveFile(fileName);
                    setActiveTab('code');
                  }}
               />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-lovable-border/50 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-lovable-surface cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              K
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-white truncate">Krish AI Pro</div>
              <div className="text-xs text-lovable-textDim truncate group-hover:text-indigo-400 transition-colors">Team Plan</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-lovable-textDim hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={12} />
            Sign Out
          </button>
          
          <div className="flex items-center justify-between px-2 pt-2 border-t border-white/5 mt-2">
            <button onClick={() => setInfoModalType('about')} className="text-[10px] text-lovable-textDim hover:text-white transition-colors">About</button>
            <button onClick={() => setInfoModalType('team')} className="text-[10px] text-lovable-textDim hover:text-white transition-colors">Team</button>
            <button onClick={() => setInfoModalType('policy')} className="text-[10px] text-lovable-textDim hover:text-white transition-colors">Privacy</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-black">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-lovable-border flex items-center justify-between px-4 bg-lovable-surface z-20">
           <div className="flex items-center gap-3">
             <button onClick={() => setShowSidebar(!showSidebar)} className="text-lovable-textMuted hover:text-white">
               <Menu size={20} />
             </button>
             <span className="font-bold text-lg text-white">Krish AI</span>
           </div>
        </div>

        {/* App Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Chat Panel - Left */}
          <div className={`w-full md:w-[450px] flex flex-col border-r border-lovable-border bg-black z-10 transition-all ${
             'hidden md:flex'
          }`}>
             {currentProject ? (
               <>
                 <div className="h-14 border-b border-lovable-border/50 flex items-center px-4 justify-between bg-black">
                    {isRenaming ? (
                      <input 
                        className="bg-lovable-surface border border-lovable-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-krish-500 w-full"
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                      />
                    ) : (
                      <div className="flex items-center gap-2 group cursor-pointer hover:bg-lovable-surface px-2 py-1 -ml-2 rounded transition-colors" onClick={() => { setIsRenaming(true); setRenameValue(currentProject.name); }}>
                        <span className="font-semibold text-sm text-white truncate max-w-[240px]">{currentProject.name}</span>
                        <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-lovable-textDim" />
                      </div>
                    )}
                 </div>
                 <ChatInterface 
                   messages={currentProject.messages} 
                   onSendMessage={handleSendMessage} 
                   isGenerating={isGenerating} 
                 />
               </>
             ) : (
               <div className="flex-1 flex items-center justify-center text-lovable-textMuted">Select a project</div>
             )}
          </div>

          {/* Preview / Code Panel - Right */}
          <div className="flex-1 flex flex-col h-full relative bg-[#0c0c0e]">
             {/* Toolbar */}
             {currentProject && (
               <div className="h-14 border-b border-lovable-border bg-black flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-lovable-surface p-1 rounded-lg border border-lovable-border">
                      <button 
                        onClick={() => { setActiveTab('preview'); setViewMode('tab'); }}
                        className={`flex items-center px-3 py-1 text-xs font-medium rounded transition-all ${activeTab === 'preview' && viewMode === 'tab' ? 'bg-lovable-bg text-white shadow-sm' : 'text-lovable-textMuted hover:text-white'}`}
                      >
                        <Zap size={12} className="mr-1.5" />
                        Preview
                      </button>
                      <button 
                        onClick={() => { setActiveTab('code'); setViewMode('tab'); }}
                        className={`flex items-center px-3 py-1 text-xs font-medium rounded transition-all ${activeTab === 'code' && viewMode === 'tab' ? 'bg-lovable-bg text-white shadow-sm' : 'text-lovable-textMuted hover:text-white'}`}
                      >
                        <Code size={12} className="mr-1.5" />
                        Code
                      </button>
                    </div>

                    <button
                      onClick={() => setViewMode(viewMode === 'split' ? 'tab' : 'split')}
                      className={`p-1.5 rounded-lg border transition-all hidden md:flex ${viewMode === 'split' ? 'bg-lovable-surface text-white border-lovable-border' : 'text-lovable-textMuted hover:text-white border-transparent'}`}
                      title="Toggle Split View"
                    >
                      {viewMode === 'split' ? <Maximize2 size={14} /> : <Columns size={14} />}
                    </button>
                  </div>
                  
                  {/* Collaboration Status & Actions */}
                  <div className="flex items-center gap-3">
                    {/* Active Collaborators */}
                    <div className="flex items-center -space-x-2 mr-2">
                      {collaborators.filter(c => c.id !== currentUser.id).map(c => (
                        <div key={c.id} className="w-7 h-7 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-black relative" style={{ backgroundColor: c.color }} title={c.name}>
                           {c.name.charAt(0)}
                           <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-black rounded-full"></span>
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded-full border-2 border-[#09090b] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white relative" title="You">
                          {currentUser.name.charAt(0)}
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-black rounded-full"></span>
                      </div>
                      <div className="ml-3 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                        <Wifi size={10} className="text-green-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-green-400">Live</span>
                      </div>
                    </div>

                     <button 
                      onClick={() => window.open('https://replit.com/new', '_blank')}
                      className="flex items-center gap-2 bg-lovable-surface hover:bg-lovable-surfaceHighlight text-lovable-textDim hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-transparent hover:border-lovable-border"
                      title="Run on Replit"
                    >
                      <Terminal size={12} className="text-orange-500" />
                      <span className="hidden sm:inline">Replit</span>
                    </button>

                    <button 
                      onClick={() => setIsPublishModalOpen(true)}
                      className="flex items-center gap-2 bg-white hover:bg-gray-200 text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-white/5"
                    >
                      <Rocket size={12} />
                      Publish
                    </button>
                  </div>
               </div>
             )}

             {/* Content */}
             <div className="flex-1 overflow-hidden relative flex flex-row">
               {!currentProject ? (
                 <div className="h-full w-full flex flex-col items-center justify-center text-lovable-textMuted p-8 text-center bg-black">
                   <div className="w-16 h-16 bg-lovable-surface rounded-2xl flex items-center justify-center mb-4 border border-lovable-border">
                     <Layout className="w-8 h-8 opacity-40 text-white" />
                   </div>
                   <h3 className="text-lg font-semibold text-white mb-2">Welcome to Krish AI</h3>
                   <p className="max-w-xs text-sm mb-6">Select a project from the sidebar or create a new one to get started.</p>
                   <button onClick={handleNewProject} className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">Create New Project</button>
                 </div>
               ) : (
                 <>
                   {/* Preview Panel */}
                   <div className={`
                      h-full flex flex-col
                      ${viewMode === 'split' ? 'w-1/2 relative border-r border-lovable-border' : 'absolute inset-0 transition-opacity duration-300'}
                      ${viewMode === 'tab' && activeTab !== 'preview' ? 'opacity-0 z-0 pointer-events-none' : 'opacity-100 z-10'}
                   `}>
                      <div className="h-full bg-black p-4 flex items-center justify-center">
                        <PreviewWindow 
                          code={currentProject.currentCode} 
                          version={currentProject.history.length}
                          projectName={currentProject.name}
                          onAutoFix={handleAutoFix}
                        />
                      </div>
                   </div>

                   {/* Code Panel */}
                   <div className={`
                      h-full flex flex-col bg-[#1e1e1e]
                      ${viewMode === 'split' ? 'w-1/2 relative' : 'absolute inset-0 transition-opacity duration-300'}
                      ${viewMode === 'tab' && activeTab !== 'code' ? 'opacity-0 z-0 pointer-events-none' : 'opacity-100 z-10'}
                   `}>
                      <div className="h-full flex flex-col">
                         {/* File Tab Header */}
                         <div className="flex items-center bg-[#1e1e1e] border-b border-lovable-border overflow-x-auto">
                            {virtualFiles.map(file => (
                              <div 
                                key={file.name}
                                onClick={() => setActiveFile(file.name)}
                                className={`
                                  flex items-center px-4 py-3 text-xs font-medium cursor-pointer border-r border-lovable-border min-w-[100px]
                                  ${activeFile === file.name ? 'bg-[#1e1e1e] text-white border-t-2 border-t-krish-500' : 'bg-[#18181b] text-gray-500 hover:bg-[#202022]'}
                                `}
                              >
                                {file.name.endsWith('.css') ? <span className="text-blue-400 mr-2">#</span> : <span className="text-yellow-400 mr-2">JS</span>}
                                {file.name}
                              </div>
                            ))}
                         </div>
                         <div className="flex-1 relative">
                            <CodeEditor 
                              code={activeFileContent} 
                              onChange={handleCodeChange}
                              collaborators={collaborators.filter(c => c.id !== currentUser.id && c.file === activeFile)}
                              onCursorChange={handleCursorChange}
                            />
                         </div>
                      </div>
                   </div>
                 </>
               )}
             </div>
          </div>

        </div>
      </main>

      {/* Modals */}
      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        code={currentProject?.currentCode || ''}
      />
      
      <InfoModal 
        isOpen={!!infoModalType}
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
}
