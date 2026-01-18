
import { Collaborator } from '../types';

type EventType = 'JOIN' | 'LEAVE' | 'HEARTBEAT' | 'CODE_UPDATE' | 'CURSOR_MOVE';

interface CollabMessage {
  type: EventType;
  senderId: string;
  payload: any;
}

class CollaborationService {
  private channel: BroadcastChannel;
  private listeners: ((message: CollabMessage) => void)[] = [];
  private userId: string;
  private userName: string;
  private userColor: string;

  constructor() {
    this.channel = new BroadcastChannel('krish_ai_collab');
    this.userId = crypto.randomUUID();
    
    // Generate random user identity
    const names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn'];
    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];
    
    this.userName = names[Math.floor(Math.random() * names.length)];
    this.userColor = colors[Math.floor(Math.random() * colors.length)];

    this.channel.onmessage = (event) => {
      this.notifyListeners(event.data);
    };

    // Send heartbeat periodically to announce presence
    setInterval(() => this.broadcast('HEARTBEAT', this.getUserInfo()), 3000);
  }

  public getUserId() {
    return this.userId;
  }

  public getUserInfo(): Collaborator {
    return {
      id: this.userId,
      name: this.userName,
      color: this.userColor,
      lastActive: Date.now()
    };
  }

  public subscribe(callback: (message: CollabMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(message: CollabMessage) {
    this.listeners.forEach(l => l(message));
  }

  private broadcast(type: EventType, payload: any) {
    const message: CollabMessage = {
      type,
      senderId: this.userId,
      payload
    };
    this.channel.postMessage(message);
  }

  public join() {
    this.broadcast('JOIN', this.getUserInfo());
  }

  public leave() {
    this.broadcast('LEAVE', { id: this.userId });
  }

  public syncCode(projectId: string, fileName: string, newCode: string) {
    this.broadcast('CODE_UPDATE', { projectId, fileName, newCode });
  }

  public syncCursor(fileName: string, position: { lineNumber: number; column: number }) {
    this.broadcast('CURSOR_MOVE', { 
      ...this.getUserInfo(),
      file: fileName,
      cursorPosition: position
    });
  }
}

export const collaborationService = new CollaborationService();
