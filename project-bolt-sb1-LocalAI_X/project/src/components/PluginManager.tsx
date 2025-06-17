import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Puzzle, 
  Plus, 
  Settings, 
  Trash2, 
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Code,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  functions: string[];
  lastUpdated: string;
  status: 'active' | 'inactive' | 'error';
}

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlugin, setShowCreatePlugin] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      // Mock data for demonstration
      setPlugins([
        {
          name: 'Weather Plugin',
          version: '1.2.0',
          description: 'Get real-time weather information for any location worldwide',
          author: 'LocalAI+ Team',
          enabled: true,
          functions: ['get_weather', 'get_forecast'],
          lastUpdated: '2 days ago',
          status: 'active'
        },
        {
          name: 'Calculator',
          version: '1.0.0',
          description: 'Perform mathematical calculations and expressions',
          author: 'LocalAI+ Team',
          enabled: true,
          functions: ['calculate', 'solve_equation'],
          lastUpdated: '1 week ago',
          status: 'active'
        },
        {
          name: 'Web Search',
          version: '0.9.0',
          description: 'Search the web and retrieve relevant information',
          author: 'Community',
          enabled: false,
          functions: ['web_search', 'get_page_content'],
          lastUpdated: '3 days ago',
          status: 'inactive'
        },
        {
          name: 'Database Query',
          version: '1.1.0',
          description: 'Execute SQL queries on connected databases',
          author: 'Enterprise User',
          enabled: true,
          functions: ['execute_query', 'get_schema'],
          lastUpdated: '5 days ago',
          status: 'error'
        }
      ]);

      setAvailablePlugins([
        {
          name: 'Email Sender',
          version: '1.0.0',
          description: 'Send emails through various providers',
          author: 'Community',
          enabled: false,
          functions: ['send_email', 'send_bulk_email'],
          lastUpdated: '1 day ago',
          status: 'inactive'
        },
        {
          name: 'File Manager',
          version: '2.1.0',
          description: 'Manage files and directories on the system',
          author: 'LocalAI+ Team',
          enabled: false,
          functions: ['list_files', 'create_file', 'delete_file'],
          lastUpdated: '4 days ago',
          status: 'inactive'
        },
        {
          name: 'Image Generator',
          version: '1.3.0',
          description: 'Generate images using AI models',
          author: 'Community',
          enabled: false,
          functions: ['generate_image', 'edit_image'],
          lastUpdated: '1 week ago',
          status: 'inactive'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      toast.error('Failed to load plugins');
      setLoading(false);
    }
  };

  const handlePluginAction = async (pluginName: string, action: 'enable' | 'disable' | 'delete' | 'install') => {
    try {
      switch (action) {
        case 'enable':
          toast.success(`Enabled ${pluginName}`);
          setPlugins(prev => prev.map(p => 
            p.name === pluginName ? { ...p, enabled: true, status: 'active' } : p
          ));
          break;
        case 'disable':
          toast.success(`Disabled ${pluginName}`);
          setPlugins(prev => prev.map(p => 
            p.name === pluginName ? { ...p, enabled: false, status: 'inactive' } : p
          ));
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete ${pluginName}?`)) {
            toast.success(`Deleted ${pluginName}`);
            setPlugins(prev => prev.filter(p => p.name !== pluginName));
          }
          break;
        case 'install':
          toast.success(`Installing ${pluginName}...`);
          const pluginToInstall = availablePlugins.find(p => p.name === pluginName);
          if (pluginToInstall) {
            setPlugins(prev => [...prev, { ...pluginToInstall, enabled: true, status: 'active' }]);
            setAvailablePlugins(prev => prev.filter(p => p.name !== pluginName));
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} plugin:`, error);
      toast.error(`Failed to ${action} plugin`);
    }
  };

  const getStatusIcon = (status: Plugin['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Plugin['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-500/20';
      case 'error':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Plugin Manager</h1>
              <p className="text-gray-300">Extend LocalAI+ with custom tools and functions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadPlugins}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowAvailable(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Browse</span>
              </button>
              <button
                onClick={() => setShowCreatePlugin(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Plugin</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Installed Plugins */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Installed Plugins</h2>
          <div className="grid grid-cols-1 gap-4">
            {plugins.map((plugin, index) => (
              <div
                key={plugin.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                      <Puzzle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-white">{plugin.name}</h3>
                        <span className="text-xs text-gray-400">v{plugin.version}</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(plugin.status)}`}>
                          {getStatusIcon(plugin.status)}
                          <span className="text-xs font-medium capitalize">{plugin.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{plugin.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-gray-300 text-sm">By {plugin.author}</span>
                        <span className="text-gray-400 text-sm">Updated {plugin.lastUpdated}</span>
                        <div className="flex items-center space-x-1">
                          <Code className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-300 text-xs">{plugin.functions.length} functions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={plugin.enabled}
                        onChange={() => handlePluginAction(plugin.name, plugin.enabled ? 'disable' : 'enable')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handlePluginAction(plugin.name, 'delete')}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {plugin.functions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Available Functions:</p>
                    <div className="flex flex-wrap gap-2">
                      {plugin.functions.map((func) => (
                        <span
                          key={func}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-mono"
                        >
                          {func}()
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Available Plugins */}
        {showAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Available Plugins</h2>
              <button
                onClick={() => setShowAvailable(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {availablePlugins.map((plugin) => (
                <div
                  key={plugin.name}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-white">{plugin.name}</h3>
                          <span className="text-xs text-gray-400">v{plugin.version}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{plugin.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-gray-300 text-sm">By {plugin.author}</span>
                          <div className="flex items-center space-x-1">
                            <Code className="w-3 h-3 text-green-400" />
                            <span className="text-green-300 text-xs">{plugin.functions.length} functions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handlePluginAction(plugin.name, 'install')}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Install</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Create Plugin Modal */}
        {showCreatePlugin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create New Plugin</h3>
                <button
                  onClick={() => setShowCreatePlugin(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plugin Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Awesome Plugin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Describe what your plugin does..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plugin Code</label>
                  <textarea
                    className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-green-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 font-mono text-sm"
                    placeholder={`# Example plugin structure
class MyPlugin:
    def __init__(self):
        self.name = "My Plugin"
    
    async def my_function(self, arguments):
        # Your plugin logic here
        return {"result": "success"}

PLUGIN_INFO = {
    "name": "My Plugin",
    "functions": [
        {
            "name": "my_function",
            "description": "Does something useful",
            "parameters": {
                "type": "object",
                "properties": {
                    "input": {"type": "string"}
                }
            }
        }
    ]
}`}
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setShowCreatePlugin(false)}
                    className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Plugin created successfully!');
                      setShowCreatePlugin(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Create Plugin
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}