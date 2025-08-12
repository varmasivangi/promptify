export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  ts: number;
  provider: string;
}
