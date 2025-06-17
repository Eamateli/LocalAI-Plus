const API_BASE_URL = 'http://localhost:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  function_result?: any;
}

export interface HealthResponse {
  status: string;
  ollama_status: string;
  message: string;
}

export const sendMessage = async (
  message: string,
  model: string,
  history: any[] = []
): Promise<ChatResponse> => {
  const messages: ChatMessage[] = [
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.7,
      functions: [
        {
          name: 'get_weather',
          description: 'Get current weather for a location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA'
              }
            },
            required: ['location']
          }
        },
        {
          name: 'calculate',
          description: 'Perform mathematical calculations',
          parameters: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: 'Mathematical expression to evaluate, e.g. 2 + 2'
              }
            },
            required: ['expression']
          }
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    function_call: data.choices[0].message.function_call,
    function_result: data.choices[0].message.function_result,
  };
};

export const getModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/models`, {
      timeout: 10000,
    } as any);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.map((model: any) => model.id);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
};

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health`, {
    timeout: 5000,
  } as any);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const testConnection = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/health`, {
      timeout: 5000,
    } as any);
    return response.ok;
  } catch (error) {
    return false;
  }
};