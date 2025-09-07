// FIX: Add a reference to Vite client types to inform TypeScript about `import.meta.env`.
/// <reference types="vite/client" />

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PlayerAction } from '../types';

// The backend URLs are now injected via environment variables
const API_URL = import.meta.env.VITE_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;

const usePokerGame = (initialStack: number, numPlayers: number, smallBlind: number, bigBlind: number) => {
  const [state, setState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  
  const userId = 'user-1'; // In a real app, this would come from auth

  useEffect(() => {
    if (!WS_URL) {
      console.error("VITE_WS_URL is not defined!");
      return;
    }

    const ws = new WebSocket(WS_URL);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Create or join a game once connected
      // For this simulation, we'll send a simple join message.
      // A real app would have table IDs, etc.
      ws.send(JSON.stringify({
        type: 'joinGame',
        payload: {
          userId,
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
  }, [initialStack, numPlayers, smallBlind, bigBlind]); // Reconnect if game config changes

  const dispatchPlayerAction = useCallback((action: PlayerAction) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      const userPlayer = state?.players.find(p => p.id === userId);
      if (userPlayer) {
         webSocketRef.current.send(JSON.stringify({
            type: 'playerAction',
            payload: {
                playerId: userPlayer.id,
                action,
            },
        }));
      }
    } else {
      console.error('WebSocket is not connected.');
    }
  }, [state, userId]);

  return { state, dispatchPlayerAction, userId, isConnected };
};

export default usePokerGame;
