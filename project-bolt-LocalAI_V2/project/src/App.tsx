import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import ModelsPage from './pages/ModelsPage';
import SettingsPage from './pages/SettingsPage';
import DocsPage from './pages/DocsPage';
import { useStore } from './store/useStore';

function App() {
  const { darkMode } = useStore();

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen overflow-hidden`}>
      <div className="flex h-full bg-gray-50 dark:bg-gray-900">
        <Router>
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/docs" element={<DocsPage />} />
            </Routes>
          </main>
        </Router>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: darkMode ? 'dark' : '',
          style: {
            background: darkMode ? '#374151' : '#ffffff',
            color: darkMode ? '#f9fafb' : '#111827',
          }
        }}
      />
    </div>
  );
}

export default App;