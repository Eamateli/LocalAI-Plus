// Create src/components/ErrorBoundary.tsx:
import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-white text-center">
            <h1 className="text-2xl mb-4">Something went wrong</h1>
            <p className="text-gray-400">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 rounded"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}