import React, { useState } from 'react';
import { GameMode, TableConfig } from '../types';
import { UsersIcon } from './Icons';

interface LobbyProps {
  onEnterPoker: (table: TableConfig) => void;
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


const Lobby: React.FC<LobbyProps> = ({ onEnterPoker, realMoneyBalance, playMoneyBalance, setRealMoneyBalance }) => {
  const [moneyTab, setMoneyTab] = useState<GameMode>(GameMode.REAL_MONEY);

  const tablesToShow = mockTables.filter(table => table.mode === moneyTab);
  const currencySymbol = moneyTab === GameMode.REAL_MONEY ? 'TON' : '$';
  const balance = moneyTab === GameMode.REAL_MONEY ? realMoneyBalance.toFixed(4) : playMoneyBalance.toLocaleString();
  
  return (
    <div className="flex flex-col items-center p-2 sm:p-4 w-full max-w-5xl mx-auto">
      <div className="text-center my-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h1 className="text-3xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-primary-accent drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]">
          CRYPTO POKER CLUB
        </h1>
        <p className="text-text-secondary mt-2 text-sm sm:text-base">The ultimate Texas Hold'em experience on Telegram.</p>
      </div>

      <div className="w-full bg-background-light rounded-xl shadow-2xl border border-brand-border animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-t border-brand-border">
            <div className="flex border border-brand-border rounded-lg overflow-hidden shrink-0">
                <button 
                  onClick={() => setMoneyTab(GameMode.REAL_MONEY)} 
                  className={`px-4 py-2 transition-colors font-semibold ${moneyTab === GameMode.REAL_MONEY ? 'bg-primary-accent text-black' : 'bg-surface hover:bg-background-light'}`}
                >
                  Real Money
                </button>
                <button 
                  onClick={() => setMoneyTab(GameMode.PLAY_MONEY)} 
                  className={`px-4 py-2 transition-colors font-semibold ${moneyTab === GameMode.PLAY_MONEY ? 'bg-gold-accent text-black' : 'bg-surface hover:bg-background-light'}`}
                >
                  Play Money
                </button>
            </div>
            <div className="text-left sm:text-right w-full">
                <p className="text-text-secondary text-sm">Balance</p>
                <p className="text-text-primary font-mono text-lg">{balance} {currencySymbol}</p>
            </div>
        </div>
        
        <div className="p-2 sm:p-4 space-y-3 max-h-[calc(100vh-22rem)] sm:max-h-[calc(100vh-20rem)] overflow-y-auto">
            {tablesToShow.length > 0 ? tablesToShow.map(table => (
                <div key={table.id} className="bg-surface/50 rounded-lg p-3 hover:bg-surface/80 transition-colors border border-transparent hover:border-primary-accent/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Block 1: Name and Description */}
                        <div className="w-full sm:w-1/3">
                            <p className="font-bold text-text-primary">{table.name}</p>
                            <p className="text-sm text-text-secondary">No-Limit Hold'em</p>
                        </div>
        
                        {/* Block 2: Stakes and Players */}
                        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-6 w-full sm:w-1/3">
                            <div className="text-center">
                                <p className="font-mono text-primary-accent text-sm sm:text-base">
                                    {currencySymbol}{table.stakes.small.toLocaleString()}/{currencySymbol}{table.stakes.big.toLocaleString()}
                                </p>
                                <p className="text-xs text-text-secondary">Stakes</p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <UsersIcon className="w-5 h-5 text-text-secondary" />
                                <span className="font-mono text-text-primary">{table.players}/{table.maxPlayers}</span>
                            </div>
                        </div>
        
                        {/* Block 3: Join Button */}
                        <div className="w-full sm:w-1/3 flex justify-end">
                            <button
                                onClick={() => onEnterPoker(table)}
                                className="w-full sm:w-auto bg-success hover:bg-success/90 text-black font-bold px-4 py-2 rounded-md text-sm transition-all transform hover:scale-105 shadow-md hover:shadow-glow-success"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
              <div className="text-center py-8 text-text-secondary">
                <p>No tables available for this mode.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
