import { useState, useEffect } from 'react';

type ModelStatus = 'running' | 'stopped' | 'downloading' | 'error';

export function useModelStatus() {
    const [status, setStatus] = useState<Record<string, ModelStatus>>({});
    
    useEffect(() => {
      const ws = new WebSocket('ws://localhost:8000/ws/models');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setStatus(prev => ({ ...prev, [data.model]: data.status }));
      };
      
      return () => ws.close();
    }, []);
    
    return status;
  }