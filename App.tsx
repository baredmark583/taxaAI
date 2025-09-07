import React, { useState, useCallback, useEffect } from 'react';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import Slots from './components/Slots';
import Roulette from './components/Roulette';
import AdminPanel from './components/AdminPanel';
import { AssetProvider } from './contexts/AssetContext';
import { GameMode, TableConfig } from './types';

type ActiveGame = 'LOBBY' | 'POKER' | 'SLOTS' | 'ROULETTE' | 'ADMIN';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

const ADMIN_TELEGRAM_ID = 7327258482;

const AppContent: React.FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('LOBBY');
  const [pokerTable, setPokerTable] = useState<TableConfig | null>(null);
  const [isGodMode, setIsGodMode] = useState(false);
  const [realMoneyBalance, setRealMoneyBalance] = useState(0.5); // Example: in ETH
  const [playMoneyBalance, setPlayMoneyBalance] = useState(10000);
  
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const TWebApp = (window as any).Telegram?.WebApp;
    if (TWebApp) {
      TWebApp.ready();
      TWebApp.expand();
      if (TWebApp.initDataUnsafe?.user) {
          setTelegramUser(TWebApp.initDataUnsafe.user);
          setInitData(TWebApp.initData);
      }
    }
    setIsInitializing(false);
  }, []);
  
  const isAdmin = telegramUser?.id === ADMIN_TELEGRAM_ID;

  const handleEnterPoker = useCallback((table: TableConfig) => {
    setPokerTable(table);
    setActiveGame('POKER');
  }, []);

  const handleExit = useCallback(() => {
    setPokerTable(null);
    setActiveGame('LOBBY');
  }, []);
  
  if (isInitializing) {
    return (
       <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-xl">Initializing...</p>
      </div>
    );
  }

  if (!telegramUser || !initData) {
     return (
       <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>
          <p className="text-lg">This application must be launched from within Telegram.</p>
          <p className="text-gray-400 mt-2">Could not retrieve user data from Telegram WebApp.</p>
      </div>
    );
  }

  if (activeGame === 'POKER' && pokerTable) {
    const initialStack = pokerTable.mode === GameMode.REAL_MONEY ? realMoneyBalance : playMoneyBalance;
    return (
      <GameTable
        table={pokerTable}
        initialStack={initialStack}
        onExit={handleExit}
        isGodMode={isGodMode}
        setIsGodMode={setIsGodMode}
        telegramUser={telegramUser}
        initData={initData}
        isAdmin={isAdmin}
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
      isAdmin={isAdmin}
    />
  );
};

const App: React.FC = () => (
  <AssetProvider>
    <AppContent />
  </AssetProvider>
);


export default App;