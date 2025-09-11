import React, { useState, useCallback, useEffect, FC, useContext } from 'react';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import Slots from './components/Slots';
import Roulette from './components/Roulette';
import Lottery from './components/Lottery';
import WalletModal from './components/WalletModal';
import { AssetProvider, AssetContext } from './contexts/AssetContext';
import { TableConfig, GameMode } from './types';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from 'sonner';

type ActiveScreen = 'LOBBY' | 'POKER' | 'SLOTS' | 'ROULETTE' | 'LOTTERY';

const App: FC = () => {
  return (
    <TonConnectUIProvider
      manifestUrl={`${(import.meta as any).env.VITE_API_URL}/api/tonconnect-manifest.json`}
      walletsListConfiguration={{
        includeWallets: [
          {
            appName: "tonkeeper",
            name: "Tonkeeper",
            imageUrl: "https://s.tonkeeper.com/App-512.png",
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
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('LOBBY');
  const [activeGameMode, setActiveGameMode] = useState<GameMode>(GameMode.REAL_MONEY);
  const [pokerTable, setPokerTable] = useState<TableConfig | null>(null);
  
  const [realMoneyBalance, setRealMoneyBalance] = useState(0);
  const [playMoneyBalance, setPlayMoneyBalance] = useState(10000);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const { assets } = useContext(AssetContext);

  useEffect(() => {
    const TWebApp = (window as any).Telegram?.WebApp;
    if (TWebApp) {
      TWebApp.ready();
      TWebApp.expand();
    }
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterGame = useCallback((screen: ActiveScreen, mode: GameMode) => {
    setActiveGameMode(mode);
    setActiveScreen(screen);
  }, []);
  
  const handleEnterPoker = useCallback((table: TableConfig) => {
    setPokerTable(table);
    setActiveScreen('POKER');
  }, []);

  const handleExitGame = useCallback(() => {
    setPokerTable(null);
    setActiveScreen('LOBBY');
  }, []);
  

  const renderContent = () => {
    switch (activeScreen) {
        case 'POKER':
            if (pokerTable) {
                return <GameTable table={pokerTable} onExit={handleExitGame} />;
            }
            // Fallback to lobby if no table is selected
            setActiveScreen('LOBBY');
            return null;

        case 'SLOTS':
            return <Slots 
                        onExit={handleExitGame} 
                        gameMode={activeGameMode}
                        realMoneyBalance={realMoneyBalance}
                        setRealMoneyBalance={setRealMoneyBalance}
                        playMoneyBalance={playMoneyBalance}
                        setPlayMoneyBalance={setPlayMoneyBalance}
                    />
        case 'ROULETTE':
             return <Roulette 
                        onExit={handleExitGame} 
                        gameMode={activeGameMode}
                        realMoneyBalance={realMoneyBalance}
                        setRealMoneyBalance={setRealMoneyBalance}
                        playMoneyBalance={playMoneyBalance}
                        setPlayMoneyBalance={setPlayMoneyBalance}
                    />
        case 'LOTTERY':
             return <Lottery
                        onExit={handleExitGame} 
                        gameMode={activeGameMode}
                        realMoneyBalance={realMoneyBalance}
                        setRealMoneyBalance={setRealMoneyBalance}
                        playMoneyBalance={playMoneyBalance}
                        setPlayMoneyBalance={setPlayMoneyBalance}
                        ticketPricePlayMoney={assets.lotteryTicketPricePlayMoney}
                        ticketPriceRealMoney={assets.lotteryTicketPriceRealMoney}
                        prizesPlayMoney={assets.lotteryPrizesPlayMoney}
                        prizesRealMoney={assets.lotteryPrizesRealMoney}
                    />;
        case 'LOBBY':
        default:
            return <Lobby
                        onEnterPoker={handleEnterPoker}
                        onEnterGame={handleEnterGame}
                        realMoneyBalance={realMoneyBalance}
                        playMoneyBalance={playMoneyBalance}
                        onBankClick={() => setWalletModalOpen(true)}
                    />
    }
  };
  
  if (isInitializing) {
    return (
       <div className="w-screen h-screen bg-background-dark flex flex-col items-center justify-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-accent"></div>
          <p className="mt-4 text-xl tracking-wider">Загрузка...</p>
      </div>
    );
  }

  const mainBgClass = activeScreen === 'POKER' ? 'bg-background-dark' : 'bg-black';

  return (
    <>
      <Toaster position="top-center" richColors />
       <div className={`flex flex-col h-screen font-sans text-text-primary ${mainBgClass}`}>
        
        <main className="flex-grow overflow-hidden">
          {renderContent()}
        </main>
        
        <WalletModal 
          isOpen={isWalletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          currentBalance={realMoneyBalance}
        />
      </div>
    </>
  );
};

export default App;