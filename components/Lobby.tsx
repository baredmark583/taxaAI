import React, { useState, useContext } from 'react';
import { GameMode, TableConfig } from '../types';
import { UsersIcon } from './Icons';
import { AssetContext } from '../contexts/AssetContext';

interface LobbyProps {
  onEnterPoker: (table: TableConfig) => void;
  onEnterGame: (screen: 'SLOTS' | 'ROULETTE' | 'LOTTERY', mode: GameMode) => void;
  realMoneyBalance: number;
  playMoneyBalance: number;
  onBankClick: () => void;
}

const mockTables: TableConfig[] = [
    { id: 'rm-1', name: 'TON Titans', mode: GameMode.REAL_MONEY, stakes: { small: 0.1, big: 0.2 }, players: 4, maxPlayers: 6 },
    { id: 'rm-2', name: 'Crypto Kings', mode: GameMode.REAL_MONEY, stakes: { small: 0.5, big: 1 }, players: 2, maxPlayers: 6 },
    { id: 'rm-3', name: 'Blockchain Bets', mode: GameMode.REAL_MONEY, stakes: { small: 2.5, big: 5 }, players: 5, maxPlayers: 9 },
    { id: 'pm-1', name: "Beginner's Luck", mode: GameMode.PLAY_MONEY, stakes: { small: 50, big: 100 }, players: 5, maxPlayers: 6 },
    { id: 'pm-2', name: 'Practice Arena', mode: GameMode.PLAY_MONEY, stakes: { small: 100, big: 200 }, players: 8, maxPlayers: 9 },
    { id: 'pm-3', name: 'Just for Fun', mode: GameMode.PLAY_MONEY, stakes: { small: 500, big: 1000 }, players: 3, maxPlayers: 6 },
];

const GameCard = ({ title, description, icon, onPlay }: { title: string, description: string, icon: string, onPlay: () => void }) => (
    <div className="bg-surface/50 rounded-lg p-4 flex flex-col items-center justify-between hover:bg-surface/80 transition-colors border border-transparent hover:border-primary-accent/50 text-center">
        <img src={icon} alt={title} className="w-24 h-24 mb-3" />
        <h3 className="font-bold text-lg text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary mb-4 h-10">{description}</p>
        <button
            onClick={onPlay}
            className="w-full bg-success hover:bg-success/90 text-black font-bold px-4 py-2 rounded-md text-sm transition-all transform hover:scale-105 shadow-md hover:shadow-glow-success"
        >
            Играть
        </button>
    </div>
);


const Lobby: React.FC<LobbyProps> = ({ onEnterPoker, onEnterGame, realMoneyBalance, playMoneyBalance, onBankClick }) => {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.REAL_MONEY);
  const [activeTab, setActiveTab] = useState<'POKER' | 'GAMES'>('POKER');
  const { assets } = useContext(AssetContext);

  const tablesToShow = mockTables.filter(table => table.mode === gameMode);
  const currencySymbol = gameMode === GameMode.REAL_MONEY ? 'TON' : '$';
  const balance = gameMode === GameMode.REAL_MONEY ? realMoneyBalance.toFixed(4) : playMoneyBalance.toLocaleString();
  
  return (
    <div className="flex flex-col h-full items-center w-full max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="text-center my-4 w-full">
        <div className="flex justify-between items-center mb-4">
            <div className="w-1/3"></div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-primary-accent drop-shadow-[0_0_15px_rgba(255,165,0,0.4)] w-1/3">
              POKER CLUB
            </h1>
            <div className="w-1/3 flex justify-end">
                <button onClick={onBankClick} className="bg-gold-accent hover:bg-gold-accent/90 text-black font-bold px-4 py-2 rounded-md text-sm transition-all transform hover:scale-105 shadow-md">
                    Банк
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full bg-black/30 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col flex-grow">
        {/* Currency and Balance Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-t border-brand-border">
            <div className="flex border border-brand-border rounded-lg overflow-hidden shrink-0">
                <button 
                  onClick={() => setGameMode(GameMode.REAL_MONEY)} 
                  className={`px-4 py-2 transition-colors font-semibold ${gameMode === GameMode.REAL_MONEY ? 'bg-primary-accent text-black' : 'bg-surface hover:bg-background-light'}`}
                >
                  Real Money
                </button>
                <button 
                  onClick={() => setGameMode(GameMode.PLAY_MONEY)} 
                  className={`px-4 py-2 transition-colors font-semibold ${gameMode === GameMode.PLAY_MONEY ? 'bg-gold-accent text-black' : 'bg-surface hover:bg-background-light'}`}
                >
                  Play Money
                </button>
            </div>
            <div className="text-left sm:text-right w-full">
                <p className="text-text-secondary text-sm">Balance</p>
                <p className="text-text-primary font-mono text-lg">{balance} {currencySymbol}</p>
            </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-brand-border">
             <button 
                onClick={() => setActiveTab('POKER')}
                className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === 'POKER' ? 'text-primary-accent border-b-2 border-primary-accent' : 'text-text-secondary'}`}
             >
                Покер
             </button>
             <button 
                onClick={() => setActiveTab('GAMES')}
                className={`flex-1 py-3 text-center font-semibold transition-colors ${activeTab === 'GAMES' ? 'text-primary-accent border-b-2 border-primary-accent' : 'text-text-secondary'}`}
             >
                Игры казино
             </button>
        </div>

        {/* Tab Content */}
        <div className="p-2 sm:p-4 flex-grow overflow-y-auto">
            {activeTab === 'POKER' ? (
                <div className="space-y-3">
                    {tablesToShow.length > 0 ? tablesToShow.map(table => (
                        <div key={table.id} className="bg-surface/50 rounded-lg p-3 hover:bg-surface/80 transition-colors border border-transparent hover:border-primary-accent/50">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="w-full sm:w-1/3">
                                    <p className="font-bold text-text-primary">{table.name}</p>
                                    <p className="text-sm text-text-secondary">No-Limit Hold'em</p>
                                </div>
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
                        <p>Нет доступных столов для этого режима.</p>
                      </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <GameCard title="Слоты" description="Испытайте удачу на наших крипто-слотах!" icon={assets.iconSlotMachine} onPlay={() => onEnterGame('SLOTS', gameMode)} />
                    <GameCard title="Рулетка" description="Делайте ставки и наблюдайте за вращением колеса." icon={assets.iconRoulette} onPlay={() => onEnterGame('ROULETTE', gameMode)} />
                    <GameCard title="Лотерея" description="Купите билет и получите шанс выиграть джекпот!" icon="https://api.iconify.design/solar/ticket-bold-duotone.svg" onPlay={() => onEnterGame('LOTTERY', gameMode)} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;