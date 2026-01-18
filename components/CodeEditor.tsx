
import React, { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Collaborator } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  collaborators?: Collaborator[];
  onCursorChange?: (position: { lineNumber: number; column: number }) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  collaborators = [], 
  onCursorChange 
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e: any) => {
      if (onCursorChange) {
        onCursorChange({ lineNumber: e.position.lineNumber, column: e.position.column });
      }
    });
  };

  // Update decorations when collaborators change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const newDecorations: any[] = [];
    const styleElement = document.getElementById('remote-cursor-styles') || document.createElement('style');
    styleElement.id = 'remote-cursor-styles';
    let css = '';

    collaborators.forEach(collab => {
      if (!collab.cursorPosition) return;

      // Create unique class for this user's cursor color
      const className = `remote-cursor-${collab.id}`;
      css += `
        .${className} {
          border-left: 2px solid ${collab.color};
          position: absolute;
        }
        .${className}::after {
          content: '${collab.name}';
          position: absolute;
          top: -18px;
          left: 0;
          background: ${collab.color};
          color: #000;
          font-size: 10px;
          padding: 0 4px;
          border-radius: 2px;
          white-space: nowrap;
          pointer-events: none;
          font-weight: bold;
        }
      `;

      newDecorations.push({
        range: new monacoRef.current!.Range(
          collab.cursorPosition.lineNumber, 
          collab.cursorPosition.column, 
          collab.cursorPosition.lineNumber, 
          collab.cursorPosition.column
        ),
        options: { className: className }
      });
    });

    styleElement.innerHTML = css;
    if (!document.getElementById('remote-cursor-styles')) {
      document.head.appendChild(styleElement);
    }

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);

  }, [collaborators]);

  return (
    <div className="h-full w-full relative group">
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="vs-dark"
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
          cursorBlinking: 'smooth',
          smoothScrolling: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full text-slate-500 bg-[#1e1e1e]">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-krish-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Loading Editor...</span>
            </div>
          </div>
        }
      />
    </div>
  );
};
