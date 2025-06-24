import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';

// Lazy load ALL heavy components
const Hero = lazy(() => import('./components/Hero'));
const FeatureGrid = lazy(() => import('./components/FeatureGrid'));
const APIPlayground = lazy(() => import('./components/APIPlayground'));
const Documentation = lazy(() => import('./components/Documentation'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ModelManager = lazy(() => import('./components/ModelManager'));
const PluginManager = lazy(() => import('./components/PluginManager'));
const Chat = lazy(() => import('./pages/Chat'));

// Create a loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-300">Loading...</p>
    </div>
  </div>
);

// HomePage component with lazy loaded components
function HomePage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
      <Hero />
      <FeatureGrid />
      <APIPlayground />
      <Documentation />
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/models" element={<ModelManager />} />
            <Route path="/plugins" element={<PluginManager />} />
            <Route path="/playground" element={<APIPlayground />} />
            <Route path="/docs" element={<Documentation />} />
          </Routes>
        </Suspense>
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