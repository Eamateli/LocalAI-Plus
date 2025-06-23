import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chatApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokens?: number;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  persona?: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Token estimation utility
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Stream chat completion
export const streamChatCompletion = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onTokenUsage?: (usage: TokenUsage) => void
) => {
  const response = await fetch(`${API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let totalTokens = 0;

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          if (onTokenUsage) {
            // Final token count
            const promptTokens = request.messages.reduce((sum, msg) => 
              sum + estimateTokens(msg.content), 0
            );
            onTokenUsage({
              prompt_tokens: promptTokens,
              completion_tokens: totalTokens,
              total_tokens: promptTokens + totalTokens
            });
          }
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content || '';
          if (content) {
            onChunk(content);
            totalTokens += estimateTokens(content);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
};