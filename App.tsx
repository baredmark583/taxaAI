import React, { useState, useCallback, useEffect } from 'react';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import Slots from './components/Slots';
import Roulette from './components/Roulette';
import AdminPanel from './components/AdminPanel';
import { AssetProvider } from './contexts/AssetContext';
import { GameMode, TableConfig } from './types';

type ActiveGame = 'LOBBY' | 'POKER' | 'SLOTS' | 'ROULETTE' | 'ADMIN';

const AppContent: React.FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('LOBBY');
  const [pokerTable, setPokerTable] = useState<TableConfig | null>(null);
  const [isGodMode, setIsGodMode] = useState(false);
  const [realMoneyBalance, setRealMoneyBalance] = useState(0.5); // Example: in ETH
  const [playMoneyBalance, setPlayMoneyBalance] = useState(10000);

  useEffect(() => {
    const TWebApp = (window as any).Telegram?.WebApp;
    if (TWebApp) {
      TWebApp.ready();
      TWebApp.expand();
    }
  }, []);

  const handleEnterPoker = useCallback((table: TableConfig) => {
    setPokerTable(table);
    setActiveGame('POKER');
  }, []);

  const handleExit = useCallback(() => {
    setPokerTable(null);
    setActiveGame('LOBBY');
  }, []);

  if (activeGame === 'POKER' && pokerTable) {
    const initialStack = pokerTable.mode === GameMode.REAL_MONEY ? realMoneyBalance : playMoneyBalance;
    return (
      <GameTable
        table={pokerTable}
        initialStack={initialStack}
        onExit={handleExit}
        isGodMode={isGodMode}
        setIsGodMode={setIsGodMode}
      />
    );
  }

  if (activeGame === 'SLOTS') {
    return (
      <Slots
        onExit={handleExit}
        realMoneyBalance={realMoneyBalance}
        playMoneyBalance={playMoneyBalance}
        setRealMoneyBalance={setRealMoneyBalance}
        setPlayMoneyBalance={setPlayMoneyBalance}
      />
    );
  }

  if (activeGame === 'ROULETTE') {
    return (
      <Roulette
        onExit={handleExit}
        realMoneyBalance={realMoneyBalance}
        playMoneyBalance={playMoneyBalance}
        setRealMoneyBalance={setRealMoneyBalance}
        setPlayMoneyBalance={setPlayMoneyBalance}
      />
    );
  }

  if (activeGame === 'ADMIN') {
    return (
      <AdminPanel onExit={handleExit} />
    );
  }

  return (
    <Lobby 
      onEnterPoker={handleEnterPoker}
      onEnterSlots={() => setActiveGame('SLOTS')}
      onEnterRoulette={() => setActiveGame('ROULETTE')}
      onEnterAdmin={() => setActiveGame('ADMIN')}
      realMoneyBalance={realMoneyBalance}
      playMoneyBalance={playMoneyBalance}
      setRealMoneyBalance={setRealMoneyBalance}
    />
  );
};

const App: React.FC = () => (
  <AssetProvider>
    <AppContent />
  </AssetProvider>
);


export default App;