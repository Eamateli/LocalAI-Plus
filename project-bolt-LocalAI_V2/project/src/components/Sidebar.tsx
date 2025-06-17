import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Settings, 
  Brain, 
  FileText, 
  Plus, 
  Menu,
  Moon,
  Sun,
  Trash2
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { 
    darkMode, 
    sidebarCollapsed, 
    chats, 
    currentChatId,
    toggleDarkMode, 
    toggleSidebar,
    createChat,
    deleteChat,
    setCurrentChat
  } = useStore();

  const navigation = [
    { name: 'Chat', href: '/', icon: MessageSquare },
    { name: 'Models', href: '/models', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Docs', href: '/docs', icon: FileText },
  ];

  const handleNewChat = () => {
    createChat();
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  return (
    <div className={`flex h-full ${sidebarCollapsed ? 'w-16' : 'w-72'} transition-all duration-300`}>
      <div className="flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                LocalAI+
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {!sidebarCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Chat History */}
        {!sidebarCollapsed && location.pathname === '/' && (
          <div className="flex-1 px-4 pb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Recent Chats
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {chats.slice(0, 20).map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setCurrentChat(chat.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {chat.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!sidebarCollapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;