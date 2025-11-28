export interface Bot {
  id: string;
  name: string;
  persona: string; // The system instruction
  avatarUrl: string;
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ChatStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR'
}