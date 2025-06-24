import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { APIPlayground } from './components/APIPlayground';
import { Documentation } from './components/Documentation';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { ModelManager } from './components/ModelManager';
import { PluginManager } from './components/PluginManager';
import { Chat } from './pages';


function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <APIPlayground />
      <Documentation />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/models" element={<ModelManager />} />
          <Route path="/plugins" element={<PluginManager />} />
          <Route path="/playground" element={<APIPlayground />} />
          <Route path="/docs" element={<Documentation />} />
        </Routes>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151'
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;