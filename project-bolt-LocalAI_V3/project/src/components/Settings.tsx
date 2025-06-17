import React, { useState, useEffect } from 'react';
import { Server, Check, AlertCircle, Settings as SettingsIcon, Globe, Zap, ExternalLink, Copy } from 'lucide-react';
import { testConnection, getHealth } from '../api';

interface ConnectionStatus {
  ollama: 'checking' | 'connected' | 'error';
  backend: 'checking' | 'connected' | 'error';
}

const Settings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [status, setStatus] = useState<ConnectionStatus>({
    ollama: 'checking',
    backend: 'checking',
  });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    checkConnections();
    const interval = setInterval(checkConnections, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkConnections = async () => {
    setStatus({ ollama: 'checking', backend: 'checking' });
    
    try {
      const health = await getHealth();
      setStatus(prev => ({
        ...prev,
        backend: health.status === 'healthy' ? 'connected' : 'error',
        ollama: health.ollama_status === 'connected' ? 'connected' : 'error',
      }));
    } catch (error) {
      setStatus({ ollama: 'error', backend: 'error' });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusIcon = (connectionStatus: 'checking' | 'connected' | 'error') => {
    switch (connectionStatus) {
      case 'checking':
        return <div className="w-4 h-4 border-2 border-slate-500 border-t-blue-400 rounded-full animate-spin" />;
      case 'connected':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (connectionStatus: 'checking' | 'connected' | 'error') => {
    switch (connectionStatus) {
      case 'checking':
        return 'text-slate-300 bg-slate-700/50 border-slate-600';
      case 'connected':
        return 'text-emerald-300 bg-emerald-900/30 border-emerald-700/50';
      case 'error':
        return 'text-red-300 bg-red-900/30 border-red-700/50';
    }
  };

  const openaiExample = `import openai

# Replace OpenAI with LocalAI+
client = openai.OpenAI(
    base_url="${apiUrl}/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="llama2",
    messages=[{"role": "user", "content": "Hello!"}]
)`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-xl w-fit mx-auto mb-4">
          <SettingsIcon className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Configure your LocalAI+ instance</p>
      </div>

      {/* Connection Status */}
      <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Server className="w-5 h-5 text-slate-400" />
          <span>Connection Status</span>
        </h3>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${getStatusColor(status.backend)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600/20 border border-blue-500/30 p-2 rounded-lg">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">LocalAI+ Backend</p>
                  <p className="text-sm opacity-75">{apiUrl}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(status.backend)}
                <button
                  onClick={() => window.open(apiUrl, '_blank')}
                  className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                  title="Open in browser"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border ${getStatusColor(status.ollama)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-600/20 border border-emerald-500/30 p-2 rounded-lg">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">Ollama Server</p>
                  <p className="text-sm opacity-75">{ollamaUrl}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(status.ollama)}
                <button
                  onClick={() => window.open(ollamaUrl, '_blank')}
                  className="p-1 hover:bg-slate-600 rounded transition-colors duration-200"
                  title="Open in browser"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={checkConnections}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 shadow-lg shadow-blue-600/25"
        >
          Refresh Status
        </button>
      </div>

      {/* API Configuration */}
      <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              LocalAI+ Backend URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-400"
              placeholder="http://localhost:8000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ollama Server URL
            </label>
            <input
              type="url"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-400"
              placeholder="http://localhost:11434"
            />
          </div>
        </div>
      </div>

      {/* OpenAI Compatibility Example */}
      <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">OpenAI Compatibility</h3>
          <button
            onClick={() => copyToClipboard(openaiExample, 'example')}
            className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors duration-200"
          >
            {copied === 'example' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied === 'example' ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        
        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-slate-300">
            <code>{openaiExample}</code>
          </pre>
        </div>
        
        <p className="text-sm text-slate-400 mt-3">
          Simply replace your OpenAI base URL with LocalAI+ and your existing code will work with local models.
        </p>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-br from-blue-900/30 to-emerald-900/30 rounded-xl border border-blue-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Quick Start</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
            <div>
              <p className="font-medium text-slate-200">Install Ollama</p>
              <p className="text-slate-400">Download from ollama.ai and install on your system</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
            <div>
              <p className="font-medium text-slate-200">Pull a model</p>
              <code className="bg-slate-800 px-2 py-1 rounded text-slate-300">ollama pull llama2</code>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <div>
              <p className="font-medium text-slate-200">Start LocalAI+</p>
              <code className="bg-slate-800 px-2 py-1 rounded text-slate-300">docker-compose up</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;