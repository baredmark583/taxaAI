import React, { useState } from 'react';
import { GameMode, TableConfig } from '../types';
import WalletModal from './WalletModal';
import { UsersIcon, PokerChipIcon, SlotMachineIcon, RouletteIcon } from './Icons';

interface LobbyProps {
  onEnterPoker: (table: TableConfig) => void;
  onEnterSlots: () => void;
  onEnterRoulette: () => void;
  realMoneyBalance: number;
  playMoneyBalance: number;
  setRealMoneyBalance: (balance: number) => void;
}

const mockTables: TableConfig[] = [
    { id: 'rm-1', name: 'TON Titans', mode: GameMode.REAL_MONEY, stakes: { small: 0.1, big: 0.2 }, players: 4, maxPlayers: 6 },
    { id: 'rm-2', name: 'Crypto Kings', mode: GameMode.REAL_MONEY, stakes: { small: 0.5, big: 1 }, players: 2, maxPlayers: 6 },
    { id: 'rm-3', name: 'Blockchain Bets', mode: GameMode.REAL_MONEY, stakes: { small: 2.5, big: 5 }, players: 5, maxPlayers: 9 },
    { id: 'pm-1', name: "Beginner's Luck", mode: GameMode.PLAY_MONEY, stakes: { small: 50, big: 100 }, players: 5, maxPlayers: 6 },
    { id: 'pm-2', name: 'Practice Arena', mode: GameMode.PLAY_MONEY, stakes: { small: 100, big: 200 }, players: 8, maxPlayers: 9 },
    { id: 'pm-3', name: 'Just for Fun', mode: GameMode.PLAY_MONEY, stakes: { small: 500, big: 1000 }, players: 3, maxPlayers: 6 },
];


const Lobby: React.FC<LobbyProps> = ({ onEnterPoker, onEnterSlots, onEnterRoulette, realMoneyBalance, playMoneyBalance, setRealMoneyBalance }) => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [moneyTab, setMoneyTab] = useState<GameMode>(GameMode.REAL_MONEY);
  const [gameTab, setGameTab] = useState('POKER');

  const tablesToShow = mockTables.filter(table => table.mode === moneyTab);
  const currencySymbol = moneyTab === GameMode.REAL_MONEY ? 'TON' : '$';
  const balance = moneyTab === GameMode.REAL_MONEY ? realMoneyBalance.toFixed(4) : playMoneyBalance.toLocaleString();
  
  const gameTabClass = (tabName: string) => `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold transform hover:scale-105 ${gameTab === tabName ? 'bg-primary-accent/20 text-primary-accent border border-primary-accent/50 shadow-glow-primary' : 'bg-surface/50 hover:bg-surface'}`;


  const renderContent = () => {
    if (gameTab === 'POKER') {
      return (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center p-4 border-b border-t border-brand-border">
              <div className="flex border border-brand-border rounded-lg overflow-hidden">
                  <button onClick={() => setMoneyTab(GameMode.REAL_MONEY)} className={`px-4 py-2 transition-colors font-semibold ${moneyTab === GameMode.REAL_MONEY ? 'bg-primary-accent text-black' : 'bg-surface hover:bg-background-light'}`}>Real Money</button>
                  <button onClick={() => setMoneyTab(GameMode.PLAY_MONEY)} className={`px-4 py-2 transition-colors font-semibold ${moneyTab === GameMode.PLAY_MONEY ? 'bg-gold-accent text-black' : 'bg-surface hover:bg-background-light'}`}>Play Money</button>
              </div>
              <div className="text-right">
                  <p className="text-text-secondary text-sm">Balance</p>
                  <p className="text-text-primary font-mono text-lg">{balance} {currencySymbol}</p>
              </div>
          </div>
          
          <div className="p-4 space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto">
              {tablesToShow.length > 0 ? tablesToShow.map(table => (
                  <div key={table.id} className="grid grid-cols-12 items-center bg-surface/50 p-3 rounded-lg hover:bg-surface/80 transition-colors border border-transparent hover:border-primary-accent/50">
                      <div className="col-span-6">
                          <p className="font-bold text-text-primary">{table.name}</p>
                          <p className="text-sm text-text-secondary">No-Limit Hold'em</p>
                      </div>
                      <div className="col-span-3 text-center">
                          <p className="font-mono text-primary-accent">{currencySymbol}{table.stakes.small.toLocaleString()}/{currencySymbol}{table.stakes.big.toLocaleString()}</p>
                          <p className="text-xs text-text-secondary">Stakes</p>
                      </div>
                      <div className="col-span-3 flex justify-end space-x-4 items-center">
                          <div className="flex items-center space-x-1">
                              <UsersIcon className="w-5 h-5 text-text-secondary" />
                              <span className="font-mono text-text-primary">{table.players}/{table.maxPlayers}</span>
                          </div>
                          <button onClick={() => onEnterPoker(table)} className="bg-success/80 hover:bg-success text-black font-bold px-4 py-2 rounded-md text-sm transition-all transform hover:scale-105 shadow-md hover:shadow-glow-success">Join</button>
                      </div>
                  </div>
              )) : (
                <div className="text-center py-8 text-text-secondary">
                  <p>No tables available for this mode.</p>
                </div>
              )}
          </div>
        </div>
      );
    }
    if (gameTab === 'SLOTS') {
      return (
        <div className="text-center p-8 flex flex-col items-center justify-center min-h-[40vh] animate-fade-in">
            <SlotMachineIcon className="w-24 h-24 text-gold-accent mb-4" />
            <h3 className="text-3xl font-bold mb-2">Crypto Slots</h3>
            <p className="text-text-secondary mb-6 max-w-sm">Classic slot machine fun with a crypto twist. Match symbols to win big!</p>
            <button onClick={onEnterSlots} className="bg-gold-accent/80 hover:bg-gold-accent text-black font-bold px-8 py-3 rounded-md text-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-glow-gold">Play Now</button>
        </div>
      );
    }
    if (gameTab === 'ROULETTE') {
      return (
         <div className="text-center p-8 flex flex-col items-center justify-center min-h-[40vh] animate-fade-in">
            <RouletteIcon className="w-24 h-24 text-danger mb-4" />
            <h3 className="text-3xl font-bold mb-2">Crypto Roulette</h3>
            <p className="text-text-secondary mb-6 max-w-sm">Place your bets and spin the wheel! Will it land on your lucky number?</p>
            <button onClick={onEnterRoulette} className="bg-danger/80 hover:bg-danger text-white font-bold px-8 py-3 rounded-md text-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-glow-danger">Play Now</button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background-light to-background-dark">
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-primary-accent drop-shadow-[0_0_15px_rgba(0,224,255,0.4)]">
          CRYPTO POKER CLUB
        </h1>
        <p className="text-text-secondary mt-2">The ultimate Texas Hold'em experience on Telegram.</p>
      </div>

      <div className="w-full max-w-4xl bg-background-light rounded-xl shadow-2xl border border-brand-border animate-slide-up animation-delay-200">
        <div className="flex justify-center p-2 bg-black/30 rounded-t-xl">
          <div className="flex space-x-2 bg-background-dark p-1 rounded-lg">
              <button onClick={() => setGameTab('POKER')} className={gameTabClass('POKER')}>
                <PokerChipIcon className="w-5 h-5" />
                <span>Poker</span>
              </button>
              <button onClick={() => setGameTab('SLOTS')} className={gameTabClass('SLOTS')}>
                 <SlotMachineIcon className="w-5 h-5" />
                 <span>Slots</span>
              </button>
              <button onClick={() => setGameTab('ROULETTE')} className={gameTabClass('ROULETTE')}>
                 <RouletteIcon className="w-5 h-5" />
                 <span>Roulette</span>
              </button>
          </div>
        </div>
        
        {renderContent()}
      </div>
      
      <div className="text-center mt-6 animate-fade-in animation-delay-400">
            <button
                onClick={() => setIsWalletOpen(true)}
                className="text-primary-accent hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-primary-accent/10"
            >
                Manage Crypto Wallet
            </button>
        </div>
      
      <WalletModal 
        isOpen={isWalletOpen} 
        onClose={() => setIsWalletOpen(false)}
        currentBalance={realMoneyBalance}
      />
    </div>
  );
};

export default Lobby;