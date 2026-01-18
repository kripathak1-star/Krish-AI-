
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachment?: string; // Base64 string for images
}

export interface GeneratedApp {
  html: string;
  explanation: string;
  timestamp: number;
  version: number;
}

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  currentCode: string | null;
  history: GeneratedApp[];
}

export type DeploymentStatus = 'idle' | 'building' | 'optimizing' | 'uploading' | 'deployed';

export interface DeploymentConfig {
  type: 'subdomain' | 'custom';
  domain: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  currentCode: string; // The single source of truth (compiled HTML)
  history: GeneratedApp[];
}

export interface VirtualFile {
  name: string;
  language: string;
  content: string;
}

// Collaboration Types
export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { lineNumber: number; column: number };
  lastActive: number;
  file?: string;
}
