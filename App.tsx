import React, { useState, useCallback, useEffect, FC } from 'react';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import Slots from './components/Slots';
import Roulette from './components/Roulette';
import WalletModal from './components/WalletModal';
import { AssetProvider } from './contexts/AssetContext';
import { TableConfig } from './types';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Toaster } from 'sonner';
import { PokerChipIcon, RouletteIcon, SlotMachineIcon } from './components/Icons';

// --- Start of components defined in-file to avoid creating new files ---

const BankIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16"></path>
    <path d="M12 12h.01"></path>
  </svg>
);

type Tab = 'POKER' | 'SLOTS' | 'ROULETTE';

interface BottomNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onBankClick: () => void;
}

const NavButton = ({ label, icon, isActive, onClick }: { label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }) => {
  const baseClasses = 'flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-200 ease-in-out text-center w-full';
  const activeClasses = 'bg-button-active-bg text-button-active-text';
  const inactiveClasses = 'bg-button-inactive-bg text-button-inactive-text hover:bg-opacity-80';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="text-xs font-bold mt-1 uppercase">{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange, onBankClick }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-background-light border-t border-brand-border flex z-50">
      <NavButton
        label="Покер"
        icon={<PokerChipIcon className="w-6 h-6" />}
        isActive={activeTab === 'POKER'}
        onClick={() => onTabChange('POKER')}
      />
      <NavButton
        label="Рулетка"
        icon={<RouletteIcon className="w-6 h-6" />}
        isActive={activeTab === 'ROULETTE'}
        onClick={() => onTabChange('ROULETTE')}
      />
      <NavButton
        label="Слоты"
        icon={<SlotMachineIcon className="w-6 h-6" />}
        isActive={activeTab === 'SLOTS'}
        onClick={() => onTabChange('SLOTS')}
      />
      <NavButton
        label="Банк"
        icon={<BankIcon className="w-6 h-6" />}
        isActive={false} // The bank button opens a modal and is never the "active tab"
        onClick={onBankClick}
      />
    </footer>
  );
};

// --- End of in-file components ---


type ActiveGame = 'LOBBY' | 'POKER' | 'SLOTS' | 'ROULETTE';

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
  const [activeTab, setActiveTab] = useState<Tab>('POKER');
  const [pokerTable, setPokerTable] = useState<TableConfig | null>(null);
  
  const [realMoneyBalance, setRealMoneyBalance] = useState(0.5);
  const [playMoneyBalance, setPlayMoneyBalance] = useState(10000);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    const TWebApp = (window as any).Telegram?.WebApp;
    if (TWebApp) {
      TWebApp.ready();
      TWebApp.expand();
    }
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterPoker = useCallback((table: TableConfig) => {
    setPokerTable(table);
  }, []);

  const handleExitPokerTable = useCallback(() => {
    setPokerTable(null);
  }, []);
  
  const handleExitGame = useCallback(() => {
      setActiveTab('POKER');
  }, []);

  const renderContent = () => {
    if (pokerTable) {
        return <GameTable table={pokerTable} onExit={handleExitPokerTable} />;
    }

    switch (activeTab) {
        case 'POKER':
            return (
                <Lobby
                    onEnterPoker={handleEnterPoker}
                    realMoneyBalance={realMoneyBalance}
                    playMoneyBalance={playMoneyBalance}
                    setRealMoneyBalance={setRealMoneyBalance}
                />
            );
        case 'SLOTS':
            return (
                <Slots
                    onExit={handleExitGame}
                    balance={playMoneyBalance}
                    setBalance={setPlayMoneyBalance}
                />
            );
        case 'ROULETTE':
            return (
                <Roulette
                    onExit={handleExitGame}
                    balance={playMoneyBalance}
                    setBalance={setPlayMoneyBalance}
                />
            );
        default:
            return <Lobby onEnterPoker={handleEnterPoker} realMoneyBalance={realMoneyBalance} playMoneyBalance={playMoneyBalance} setRealMoneyBalance={setRealMoneyBalance}/>;
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

  return (
    <>
      <Toaster position="top-center" richColors />
       <div className="flex flex-col h-screen font-sans bg-background-dark text-text-primary">
        <header className="h-[60px] flex-shrink-0 w-full" />
        
        <main className="flex-grow overflow-y-auto pb-16">
          {renderContent()}
        </main>
        
        <BottomNavBar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBankClick={() => setWalletModalOpen(true)}
        />
        
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