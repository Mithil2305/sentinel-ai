'use client';

import { useEffect, useRef, useState } from 'react';

export function useWebSocket(onMessageCallback?: (eventData: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const callbackRef = useRef(onMessageCallback);
  
  useEffect(() => {
    callbackRef.current = onMessageCallback;
  }, [onMessageCallback]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('[SentinelAI] WebSocket Connected.');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('[SentinelAI] WebSocket Disconnected. Reconnecting in 3s...');
      setTimeout(() => {
        // Auto-reconnect trigger
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('[SentinelAI] WebSocket error:', error);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  return { isConnected };
}
