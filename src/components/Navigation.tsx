import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home,
  MessageSquare, 
  BarChart3, 
  Cpu, 
  Puzzle, 
  PlayCircle, 
  BookOpen 
} from 'lucide-react';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/chat', label: 'Chat', icon: MessageSquare }, 
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/models', label: 'Models', icon: Cpu },
    { path: '/plugins', label: 'Plugins', icon: Puzzle },
    { path: '/playground', label: 'Playground', icon: PlayCircle },
    { path: '/docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/Image_navbar_logo-removebg.png" 
              alt="LocalAI+ Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-white">LocalAI+</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-gray-300 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}