import React, { useState } from 'react';
import { GameMode, TableConfig } from '../types';
import WalletModal from './WalletModal';
import { UsersIcon, PokerChipIcon, SlotMachineIcon, RouletteIcon } from './Icons';

interface LobbyProps {
  onEnterPoker: (table: TableConfig) => void;
  onEnterSlots: () => void;
  onEnterRoulette: () => void;
  onEnterAdmin: () => void;
  realMoneyBalance: number;
  playMoneyBalance: number;
  setRealMoneyBalance: (balance: number) => void;
  isAdmin: boolean;
}

const mockTables: TableConfig[] = [
    { id: 'rm-1', name: 'TON Titans', mode: GameMode.REAL_MONEY, stakes: { small: 0.1, big: 0.2 }, players: 4, maxPlayers: 6 },
    { id: 'rm-2', name: 'Crypto Kings', mode: GameMode.REAL_MONEY, stakes: { small: 0.5, big: 1 }, players: 2, maxPlayers: 6 },
    { id: 'rm-3', name: 'Blockchain Bets', mode: GameMode.REAL_MONEY, stakes: { small: 2.5, big: 5 }, players: 5, maxPlayers: 9 },
    { id: 'pm-1', name: "Beginner's Luck", mode: GameMode.PLAY_MONEY, stakes: { small: 50, big: 100 }, players: 5, maxPlayers: 6 },
    { id: 'pm-2', name: 'Practice Arena', mode: GameMode.PLAY_MONEY, stakes: { small: 100, big: 200 }, players: 8, maxPlayers: 9 },
    { id: 'pm-3', name: 'Just for Fun', mode: GameMode.PLAY_MONEY, stakes: { small: 500, big: 1000 }, players: 3, maxPlayers: 6 },
];


const Lobby: React.FC<LobbyProps> = ({ onEnterPoker, onEnterSlots, onEnterRoulette, onEnterAdmin, realMoneyBalance, playMoneyBalance, setRealMoneyBalance, isAdmin }) => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [moneyTab, setMoneyTab] = useState<GameMode>(GameMode.REAL_MONEY);
  const [gameTab, setGameTab] = useState('POKER');

  const tablesToShow = mockTables.filter(table => table.mode === moneyTab);
  const currencySymbol = moneyTab === GameMode.REAL_MONEY ? 'TON' : '$';
  const balance = moneyTab === GameMode.REAL_MONEY ? realMoneyBalance.toFixed(4) : playMoneyBalance.toLocaleString();
  
  const gameTabClass = (tabName: string) => `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-semibold ${gameTab === tabName ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-600'}`;


  const renderContent = () => {
    if (gameTab === 'POKER') {
      return (
        <>
          {/* Header with Money Tabs and Balance */}
          <div className="flex justify-between items-center p-4 border-b border-t border-gray-700">
              <div className="flex border border-gray-600 rounded-lg">
                  <button onClick={() => setMoneyTab(GameMode.REAL_MONEY)} className={`px-4 py-2 rounded-l-md transition-colors ${moneyTab === GameMode.REAL_MONEY ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Real Money</button>
                  <button onClick={() => setMoneyTab(GameMode.PLAY_MONEY)} className={`px-4 py-2 rounded-r-md transition-colors ${moneyTab === GameMode.PLAY_MONEY ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Play Money</button>
              </div>
              <div className="text-right">
                  <p className="text-gray-400 text-sm">Balance</p>
                  <p className="text-white font-mono text-lg">{balance} {currencySymbol}</p>
              </div>
          </div>
          
          {/* Table List */}
          <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
              {tablesToShow.length > 0 ? tablesToShow.map(table => (
                  <div key={table.id} className="grid grid-cols-4 items-center bg-gray-900/50 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="col-span-2">
                          <p className="font-bold text-white">{table.name}</p>
                          <p className="text-sm text-gray-400">No-Limit Hold'em</p>
                      </div>
                      <div className="text-center">
                          <p className="font-mono text-cyan-400">{currencySymbol}{table.stakes.small.toLocaleString()}/{currencySymbol}{table.stakes.big.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Stakes</p>
                      </div>
                      <div className="flex justify-end space-x-4 items-center">
                          <div className="flex items-center space-x-1">
                              <UsersIcon className="w-5 h-5 text-gray-400" />
                              <span className="font-mono text-white">{table.players}/{table.maxPlayers}</span>
                          </div>
                          <button onClick={() => onEnterPoker(table)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-md text-sm">Join</button>
                      </div>
                  </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No tables available for this mode.</p>
                </div>
              )}
          </div>
        </>
      );
    }
    if (gameTab === 'SLOTS') {
      return (
        <div className="text-center p-8 flex flex-col items-center justify-center min-h-[40vh]">
            <SlotMachineIcon className="w-24 h-24 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Crypto Slots</h3>
            <p className="text-gray-400 mb-6 max-w-sm">Classic slot machine fun with a crypto twist. Match symbols like Bitcoin, Ethereum, and Diamonds to win big!</p>
            <button onClick={onEnterSlots} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-md text-lg transition-transform transform hover:scale-105">Play Now</button>
        </div>
      );
    }
    if (gameTab === 'ROULETTE') {
      return (
         <div className="text-center p-8 flex flex-col items-center justify-center min-h-[40vh]">
            <RouletteIcon className="w-24 h-24 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Crypto Roulette</h3>
            <p className="text-gray-400 mb-6 max-w-sm">Place your bets and spin the wheel! A classic casino game of chance. Will it land on your lucky number?</p>
            <button onClick={onEnterRoulette} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-md text-lg transition-transform transform hover:scale-105">Play Now</button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white tracking-wider">
          CRYPTO POKER <span className="text-cyan-400">CLUB</span>
        </h1>
        <p className="text-gray-400 mt-2">The ultimate Texas Hold'em experience on Telegram.</p>
      </div>

      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="flex justify-center p-2 bg-gray-900/50 rounded-t-xl">
          <div className="flex space-x-2 bg-gray-700 p-1 rounded-lg">
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
      
      <div className="text-center mt-6 flex space-x-4">
            <button
                onClick={() => setIsWalletOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
            >
                Manage Crypto Wallet
            </button>
            {isAdmin && (
                <button
                    onClick={onEnterAdmin}
                    className="text-gray-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    Админ-панель
                </button>
            )}
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