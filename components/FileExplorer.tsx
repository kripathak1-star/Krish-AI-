import React, { useState } from 'react';
import { FileCode2, FileJson, Hash, Code, FolderOpen, ChevronDown, ChevronRight, FileType, Layout } from 'lucide-react';
import { VirtualFile } from '../types';

interface FileExplorerProps {
  files: VirtualFile[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onFileSelect }) => {
  const [isSrcOpen, setIsSrcOpen] = useState(true);

  const getIcon = (fileName: string) => {
    // CSS - # icon, sky blue
    if (fileName.endsWith('.css')) return <Hash size={14} className="text-sky-400" />;
    
    // HTML - <> icon, orange
    if (fileName.endsWith('.html')) return <Code size={14} className="text-orange-500" />;
    
    // React/TypeScript - file code icon, blue
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return <FileCode2 size={14} className="text-blue-400" />;
    
    // JavaScript/JSX - file code icon, yellow
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return <FileCode2 size={14} className="text-yellow-400" />;
    
    // JSON
    if (fileName.endsWith('.json')) return <FileJson size={14} className="text-yellow-200" />;
    
    // Default
    return <FileType size={14} className="text-slate-400" />;
  };

  return (
    <div className="flex flex-col w-full select-none">
      <div 
        className="flex items-center px-3 py-2 text-lovable-textMuted hover:text-white cursor-pointer group transition-colors"
        onClick={() => setIsSrcOpen(!isSrcOpen)}
      >
        {isSrcOpen ? <ChevronDown size={14} className="mr-1 opacity-70" /> : <ChevronRight size={14} className="mr-1 opacity-70" />}
        <FolderOpen size={14} className="mr-2 text-blue-500" />
        <span className="text-xs font-semibold tracking-wide text-lovable-text group-hover:text-white transition-colors">src</span>
      </div>
      
      {isSrcOpen && (
        <div className="pl-2 flex flex-col gap-0.5">
          {files.map((file) => (
            <div
              key={file.name}
              onClick={() => onFileSelect(file.name)}
              className={`
                flex items-center px-3 py-1.5 cursor-pointer text-xs transition-all rounded-md mx-2
                ${activeFile === file.name 
                  ? 'bg-lovable-surfaceHighlight text-white font-medium shadow-sm' 
                  : 'text-lovable-textDim hover:text-white hover:bg-white/5'}
              `}
            >
              <span className="mr-2 opacity-100 flex-shrink-0">{getIcon(file.name)}</span>
              <span className="font-mono truncate">{file.name}</span>
            </div>
          ))}
          {/* Fake package.json for realism */}
          <div className="flex items-center px-3 py-1.5 cursor-not-allowed text-xs text-lovable-textDim opacity-50 mx-2">
            <FileJson size={14} className="mr-2 text-red-400" />
            <span className="font-mono">package.json</span>
          </div>
        </div>
      )}
    </div>
  );
};