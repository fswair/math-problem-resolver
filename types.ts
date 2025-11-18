export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string
  timestamp: number;
  isThinking?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum ModelNames {
  GEMINI_3_PRO_PREVIEW = 'gemini-3-pro-preview',
}
