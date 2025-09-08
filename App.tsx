import React, { useState, useCallback, useEffect, FC } from 'react';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import Slots from './components/Slots';
import Roulette from './components/Roulette';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { AssetProvider } from './contexts/AssetContext';
import { GameMode, TableConfig } from './types';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

type ActiveGame = 'LOBBY' | 'POKER' | 'SLOTS' | 'ROULETTE' | 'ADMIN';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

const ADMIN_TELEGRAM_ID = 7327258482;

const TelegramFlow: FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('LOBBY');
  const [pokerTable, setPokerTable] = useState<TableConfig | null>(null);
  const [isGodMode, setIsGodMode] = useState(false);
  const [realMoneyBalance, setRealMoneyBalance] = useState(0.5);
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


const AdminFlow: FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAdminAuthenticated') === 'true');

    const handleLogout = () => {
        sessionStorage.removeItem('isAdminAuthenticated');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return <AdminPanel onExit={handleLogout} isBrowserView={true} />;
};


const AppRouter: FC = () => {
  // Get the hash part of the URL (e.g., '#/admin') and remove the leading '#'
  const getRoute = () => window.location.hash.substring(1);
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
    };
    
    // Listen for hash changes (e.g., clicking links, browser back/forward)
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  
  // Check if the route starts with '/admin'
  if (route.toLowerCase().startsWith('/admin')) {
    return <AdminFlow />;
  }
  
  // Default to the main Telegram app flow
  return <TelegramFlow />;
}

// TON Connect manifest definition. This describes our app to the wallet.
const tonConnectManifest = {
    url: 'https://crypto-poker.netlify.app', // A placeholder URL
    name: 'Crypto Poker Club',
    iconUrl: 'https://www.svgrepo.com/show/475685/poker-chip.svg' // A placeholder icon
};


const App: FC = () => {
  // The TonConnectUIProvider must wrap the entire app that needs wallet access.
  // In v3, we pass the manifest object directly to the 'manifest' prop.
  
  return (
    <TonConnectUIProvider 
        manifest={tonConnectManifest}
    >
        <AssetProvider>
            <AppRouter />
        </AssetProvider>
    </TonConnectUIProvider>
  );
};


export default App;