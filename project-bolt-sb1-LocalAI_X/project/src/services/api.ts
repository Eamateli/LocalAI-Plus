const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string = API_BASE_URL, apiKey: string = 'test-key-12345') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Chat Completions
  async chatCompletion(data: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    tools?: any[];
  }) {
    return this.request('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Embeddings
  async createEmbeddings(data: {
    input: string | string[];
    model?: string;
  }) {
    return this.request('/v1/embeddings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Code Execution
  async executeCode(data: {
    code: string;
    language?: string;
    timeout?: number;
  }) {
    return this.request('/v1/code/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tools
  async listTools() {
    return this.request('/v1/tools');
  }

  async executeTool(data: {
    tool_name: string;
    arguments: Record<string, any>;
  }) {
    return this.request('/v1/tools/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Models
  async listModels() {
    return this.request('/models');
  }

  // Plugins
  async listPlugins() {
    return this.request('/v1/plugins');
  }

  async registerPlugin(data: {
    name: string;
    description: string;
    version?: string;
    author?: string;
    functions: any[];
  }) {
    return this.request('/v1/plugins/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }

  // Vector Search
  async semanticSearch(data: {
    query: string;
    collection?: string;
    limit?: number;
  }) {
    return this.request('/v1/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Store Embeddings
  async storeEmbeddings(data: {
    texts: string[];
    metadata?: any[];
    collection?: string;
  }) {
    return this.request('/v1/store', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();