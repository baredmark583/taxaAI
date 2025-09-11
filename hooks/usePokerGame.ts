import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PlayerAction } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL;
const WS_URL = (import.meta as any).env.VITE_WS_URL;

const usePokerGame = (tableId: string, initialStack: number, numPlayers: number, smallBlind: number, bigBlind: number) => {
  const [state, setState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const TWebApp = (window as any).Telegram?.WebApp;
    if (!WS_URL || !TWebApp?.initData || !TWebApp.initDataUnsafe?.user) {
      console.error("WebSocket URL or Telegram data is not available.");
      return; // Do not proceed if essential data is missing
    }

    const currentInitData = TWebApp.initData;
    const currentUserId = TWebApp.initDataUnsafe.user.id.toString();
    setUserId(currentUserId);

    const ws = new WebSocket(WS_URL);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      ws.send(JSON.stringify({
        type: 'joinGame',
        payload: {
          initData: currentInitData,
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
      setState(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws) {
        ws.close();
        webSocketRef.current = null;
      }
    };
  }, [tableId, initialStack, numPlayers, smallBlind, bigBlind]);

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