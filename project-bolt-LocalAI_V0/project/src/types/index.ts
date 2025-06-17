export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  folderId?: string | null;
  settings: Record<string, any>;
}

export interface ChatFolder {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: Date;
  color?: string;
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  format?: string;
  loaded?: boolean;
  config?: Record<string, any>;
}

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: FunctionCall;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  source?: string;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface RAGSearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
}

export interface ExecutionResult {
  id: string;
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  exitCode: number;
}