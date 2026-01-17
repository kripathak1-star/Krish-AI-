import React from 'react';
import { FileCode2, FileJson, Hash, Code, FolderOpen, ChevronDown } from 'lucide-react';
import { VirtualFile } from '../types';

interface FileExplorerProps {
  files: VirtualFile[];
  activeFile: string | null;
  onFileSelect: (fileName: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, onFileSelect }) => {
  const getIcon = (fileName: string) => {
    if (fileName.endsWith('.css')) return <Hash size={14} className="text-blue-400" />;
    if (fileName.endsWith('.tsx') || fileName.endsWith('.js')) return <FileCode2 size={14} className="text-yellow-400" />;
    if (fileName.endsWith('.html')) return <Code size={14} className="text-orange-500" />;
    return <FileCode2 size={14} className="text-slate-400" />;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center px-3 py-2 text-lovable-textMuted hover:text-white cursor-pointer group">
        <ChevronDown size={14} className="mr-1" />
        <FolderOpen size={14} className="mr-2 text-blue-500" />
        <span className="text-xs font-semibold tracking-wide text-lovable-text">src</span>
      </div>
      <div className="pl-4">
        {files.map((file) => (
          <div
            key={file.name}
            onClick={() => onFileSelect(file.name)}
            className={`
              flex items-center px-3 py-1.5 cursor-pointer text-xs transition-colors border-l-2
              ${activeFile === file.name 
                ? 'bg-lovable-surfaceHighlight text-white border-krish-500' 
                : 'text-lovable-textDim hover:text-white border-transparent hover:bg-white/5'}
            `}
          >
            <span className="mr-2 opacity-80">{getIcon(file.name)}</span>
            <span className="font-mono">{file.name}</span>
          </div>
        ))}
        {/* Fake package.json for realism */}
        <div className="flex items-center px-3 py-1.5 cursor-not-allowed text-xs text-lovable-textDim border-l-2 border-transparent opacity-50">
          <FileJson size={14} className="mr-2 text-red-400" />
          <span className="font-mono">package.json</span>
        </div>
      </div>
    </div>
  );
};