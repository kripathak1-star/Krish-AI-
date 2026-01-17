import { VirtualFile } from '../types';

export const splitCode = (fullHtml: string): VirtualFile[] => {
  if (!fullHtml) return [{ name: 'index.html', language: 'html', content: '' }];

  const files: VirtualFile[] = [];

  // 1. Extract CSS
  const styleMatch = fullHtml.match(/<style>([\s\S]*?)<\/style>/);
  const cssContent = styleMatch ? styleMatch[1].trim() : '';
  if (cssContent) {
    files.push({ name: 'styles.css', language: 'css', content: cssContent });
  }

  // 2. Extract React/JS
  const scriptMatch = fullHtml.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
  const jsContent = scriptMatch ? scriptMatch[1].trim() : '';
  if (jsContent) {
    files.push({ name: 'App.tsx', language: 'javascript', content: jsContent });
  }

  // 3. Create stripped HTML (keep structure but remove extracted contents for cleaner view)
  // Note: For simplicity in this version, we might just show the full HTML as "index.html" 
  // or a stripped version. Let's provide the FULL HTML as index.html for safety, 
  // but allow editing the specific parts via the virtual files.
  files.unshift({ name: 'index.html', language: 'html', content: fullHtml });

  return files;
};

export const mergeCode = (originalHtml: string, fileName: string, newContent: string): string => {
  if (fileName === 'index.html') return newContent;

  if (fileName === 'styles.css') {
    return originalHtml.replace(
      /<style>[\s\S]*?<\/style>/,
      `<style>\n${newContent}\n    </style>`
    );
  }

  if (fileName === 'App.tsx') {
    return originalHtml.replace(
      /<script type="text\/babel">[\s\S]*?<\/script>/,
      `<script type="text/babel">\n${newContent}\n    </script>`
    );
  }

  return originalHtml;
};