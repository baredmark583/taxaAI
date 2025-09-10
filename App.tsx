import React, { useState, useCallback, useEffect, FC } from 'react';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import Slots from './components/Slots';
import Roulette from './components/Roulette';
import WalletModal from './components/WalletModal';
import { AssetProvider } from './contexts/AssetContext';
import { GameMode, TableConfig } from './types';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from 'sonner';

type ActiveGame = 'LOBBY' | 'POKER' | 'SLOTS' | 'ROULETTE';

// NOTE: This component remains to keep the Telegram authentication flow intact.
// The main UI logic is now handled by AppContent.
const App: FC = () => {
  return (
    // The TonConnectUIProvider is kept at the root as it's a context provider
    // and doesn't interfere with the UI restructuring.
    <TonConnectUIProvider
      manifestUrl={`${(import.meta as any).env.VITE_API_URL}/api/tonconnect-manifest.json`}
      walletsListConfiguration={{
        includeWallets: [
          {
            appName: "tonkeeper",
            name: "Tonkeeper",
            imageUrl: "https://s.tonkeeper.com/App-512.png",
            // FIX: Added missing properties to satisfy the UIWallet type, which seems to have become stricter.
            universalLink: "https://app.tonkeeper.com/ton-connect",
            bridgeUrl: "https://bridge.tonapi.io/bridge",
            aboutUrl: "https://tonkeeper.com",
            platforms: ["chrome", "firefox", "safari", "ios", "android"]
          }
        ]
      }}
    >
      <AssetProvider>
        <AppContent />
      </AssetProvider>
    </TonConnectUIProvider>
  );
};


const AppContent: FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('LOBBY');
  const [pokerTable, setPokerTable] = useState<TableConfig | null>(null);
  
  // Mock balances for UI display purposes
  const [realMoneyBalance, setRealMoneyBalance] = useState(0.5);
  const [playMoneyBalance, setPlayMoneyBalance] = useState(10000);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  // Simulate Telegram WebApp initialization
  useEffect(() => {
    const TWebApp = (window as any).Telegram?.WebApp;
    if (TWebApp) {
      TWebApp.ready();
      TWebApp.expand();
    }
    // Simulate loading time
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
       <div className="w-screen h-screen bg-background-dark flex flex-col items-center justify-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-accent"></div>
          <p className="mt-4 text-xl tracking-wider">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
       <Toaster position="top-center" richColors />
      {activeGame === 'POKER' && pokerTable && (
        <GameTable
          table={pokerTable}
          onExit={handleExit}
        />
      )}

      {activeGame === 'SLOTS' && (
        <Slots
          onExit={handleExit}
          balance={playMoneyBalance}
          setBalance={setPlayMoneyBalance}
        />
      )}

      {activeGame === 'ROULETTE' && (
        <Roulette
          onExit={handleExit}
          balance={playMoneyBalance}
          setBalance={setPlayMoneyBalance}
        />
      )}

      {activeGame === 'LOBBY' && (
         <Lobby 
          onEnterPoker={handleEnterPoker}
          onEnterSlots={() => setActiveGame('SLOTS')}
          onEnterRoulette={() => setActiveGame('ROULETTE')}
          onManageWallet={() => setWalletModalOpen(true)}
          realMoneyBalance={realMoneyBalance}
          playMoneyBalance={playMoneyBalance}
          setRealMoneyBalance={setRealMoneyBalance}
        />
      )}
      
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        currentBalance={realMoneyBalance}
      />
    </>
  );
};

export default App;