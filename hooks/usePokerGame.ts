import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PlayerAction } from '../types';

// The backend URLs are now injected via environment variables
// FIX: Cast import.meta to any to access env properties without vite/client types, resolving a TypeScript error.
const API_URL = (import.meta as any).env.VITE_API_URL;
const WS_URL = (import.meta as any).env.VITE_WS_URL;

const usePokerGame = (tableId: string, initialStack: number, numPlayers: number, smallBlind: number, bigBlind: number) => {
  const [state, setState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [initData, setInitData] = useState<string | null>(null);

  useEffect(() => {
     const TWebApp = (window as any).Telegram?.WebApp;
     if (TWebApp && TWebApp.initData) {
        setInitData(TWebApp.initData);
        if (TWebApp.initDataUnsafe?.user) {
            setUserId(TWebApp.initDataUnsafe.user.id.toString());
        }
     }
  }, []);

  useEffect(() => {
    if (!WS_URL || !userId || !initData) {
      console.error("Missing WebSocket URL, userId, or initData!");
      return;
    }

    const ws = new WebSocket(WS_URL);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Join a game with authentication data
      ws.send(JSON.stringify({
        type: 'joinGame',
        payload: {
          initData,
          initialStack,
          numPlayers,
          blinds: { small: smallBlind, big: bigBlind }
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'gameStateUpdate') {
          setState(message.payload);
        } else if (message.type === 'error') {
            alert(`Server error: ${message.payload.message}`);
            console.error('Server error:', message.payload.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setState(null); // Clear state on disconnect
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, [tableId, initialStack, numPlayers, smallBlind, bigBlind, userId, initData]); // Reconnect if game config changes

  const dispatchPlayerAction = useCallback((action: PlayerAction) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN && userId) {
        webSocketRef.current.send(JSON.stringify({
            type: 'playerAction',
            payload: {
                playerId: userId,
                action,
            },
        }));
    } else {
      console.error('WebSocket is not connected or user is not identified.');
    }
  }, [userId]);

  return { state, dispatchPlayerAction, isConnected, userId };
};

export default usePokerGame;