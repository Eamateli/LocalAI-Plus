import React, { useState } from 'react';
import { Settings, Save, Key, Server, Sliders, Shield, Database } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatService } from '../services/chatService';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('api');
  const [testing, setTesting] = useState(false);

  const tabs = [
    { id: 'api', name: 'API Configuration', icon: Server },
    { id: 'model', name: 'Model Settings', icon: Sliders },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'advanced', name: 'Advanced', icon: Database },
  ];

  const handleSave = () => {
    updateSettings(localSettings);
    chatService.updateConfig(localSettings.apiUrl, localSettings.apiKey);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setLocalSettings(settings);
    toast.info('Settings reset to saved values');
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const tempService = new (chatService.constructor as any)();
      tempService.updateConfig(localSettings.apiUrl, localSettings.apiKey);
      await tempService.getModels();
      toast.success('Connection test successful');
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure your LocalAI+ instance
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  API Configuration
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={localSettings.apiUrl}
                      onChange={(e) => updateLocalSetting('apiUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="http://localhost:8000/v1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={localSettings.apiKey}
                        onChange={(e) => updateLocalSetting('apiKey', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="sk-your-api-key"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={testConnection}
                    disabled={testing}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    <Server className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
                    <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Model Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temperature: {localSettings.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={localSettings.temperature}
                      onChange={(e) => updateLocalSetting('temperature', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Conservative (0)</span>
                      <span>Creative (2)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8192"
                      value={localSettings.maxTokens}
                      onChange={(e) => updateLocalSetting('maxTokens', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="streaming"
                      checked={localSettings.streamingEnabled}
                      onChange={(e) => updateLocalSetting('streamingEnabled', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="streaming" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Streaming Responses
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Security Settings
                </h2>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Security Notice
                    </h3>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-2 text-sm">
                    LocalAI+ includes built-in security features like API key authentication, 
                    rate limiting, and secure code execution sandboxing. Additional security 
                    configurations will be available in future updates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Advanced Settings
                </h2>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-blue-800 dark:text-blue-200">
                      Advanced Features
                    </h3>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 mt-2 text-sm">
                    Advanced features like RAG configuration, function calling settings, 
                    and model context protocol (MCP) options will be available here in 
                    future updates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;