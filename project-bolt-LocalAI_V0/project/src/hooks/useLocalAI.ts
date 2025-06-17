import { useState, useEffect, useCallback } from 'react';
import { Message, Model, StreamChunk } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || 'localai-plus-default-key';

export function useLocalAI() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available models
  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setModels(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send chat message
  const sendMessage = useCallback(async (
    messages: Message[],
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const requestBody = {
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2048,
        stream: options.stream || false,
      };

      const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (options.stream) {
        return response; // Return the response for streaming
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stream response handler
  const streamResponse = useCallback(async function* (
    messages: Message[],
    model: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      setIsLoading(true);
      setError(null);

      const response = await sendMessage(messages, model, {
        ...options,
        stream: true,
      }) as Response;

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed: StreamChunk = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } catch (err) {
      console.error('Error streaming response:', err);
      setError(err instanceof Error ? err.message : 'Failed to stream response');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sendMessage]);

  // Execute code
  const executeCode = useCallback(async (
    code: string,
    language: string = 'python'
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/code/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error executing code:', err);
      throw err;
    }
  }, []);

  // Search documents
  const searchDocuments = useCallback(async (
    query: string,
    options: {
      topK?: number;
      threshold?: number;
      collection?: string;
    } = {}
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/rag/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: options.topK || 5,
          threshold: options.threshold || 0.7,
          collection: options.collection,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error searching documents:', err);
      throw err;
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    isLoading,
    error,
    sendMessage,
    streamResponse,
    executeCode,
    searchDocuments,
    refetchModels: fetchModels,
  };
}