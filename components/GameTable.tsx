import React, { useState, useContext } from 'react';
import { GameMode, TableConfig, GamePhase } from '../types';
import Player from './Player';
import CommunityCards from './CommunityCards';
import ActionControls from './ActionControls';
import usePokerGame from '../hooks/usePokerGame';
import { ExitIcon, SettingsIcon } from './Icons';
import SettingsModal from './SettingsModal';
import { AssetContext } from '../contexts/AssetContext';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface GameTableProps {
  table: TableConfig;
  initialStack: number;
  onExit: () => void;
  isGodMode: boolean;
  setIsGodMode: (active: boolean) => void;
  telegramUser: TelegramUser;
  initData: string;
}

const positions = [
  { top: '8%', left: '50%', transform: 'translateX(-50%)' },
  { top: '25%', right: '5%', transform: '' },
  { top: '60%', right: '5%', transform: '' },
  { bottom: '5%', right: '25%', transform: '' },
  { bottom: '5%', left: '25%', transform: '' },
  { top: '60%', left: '5%', transform: '' },
  { top: '25%', left: '5%', transform: '' },
];


const GameTable: React.FC<GameTableProps> = ({ table, initialStack, onExit, isGodMode, setIsGodMode, telegramUser, initData }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { assets } = useContext(AssetContext);
  const userId = telegramUser.id.toString();
  const { state, dispatchPlayerAction, isConnected } = usePokerGame(initialStack, table.maxPlayers, table.stakes.small, table.stakes.big, userId, initData);

  if (!isConnected || !state) {
      return (
          <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="mt-4 text-xl">{!isConnected ? "Connecting to server..." : "Joining table..."}</p>
          </div>
      );
  }

  const { players, communityCards, pot, activePlayerIndex, gamePhase, log } = state;

  const userPlayer = players.find(p => p.id === userId);
  const otherPlayers = players.filter(p => p.id !== userId);
  const currency = table.mode === GameMode.REAL_MONEY ? 'ETH' : '$';
  const formatCurrency = (amount: number) => {
      if (table.mode === GameMode.REAL_MONEY) {
          return amount.toFixed(4);
      }
      return amount.toLocaleString();
  }

  const userHandCards = userPlayer?.handResult?.cards || [];

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center p-2 overflow-hidden font-sans">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-900/50 z-20">
            <button onClick={onExit} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <ExitIcon className="w-6 h-6" />
                <span>Lobby</span>
            </button>
            <div className="text-center">
                <p className="text-lg font-bold text-cyan-400">{table.name}</p>
                <p className="text-xs text-gray-400">Stakes: {currency}{formatCurrency(table.stakes.small)}/{currency}{formatCurrency(table.stakes.big)}</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="text-gray-300 hover:text-white transition-colors">
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>


      <div 
        className="relative w-[95vw] h-[60vh] max-w-4xl max-h-[600px] bg-green-800 border-8 border-gray-700 rounded-[50px] shadow-2xl flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${assets.tableBackgroundUrl})`}}
       >
        <div className="absolute w-[80%] h-[75%] border-4 border-yellow-700/50 rounded-[40px]"></div>
        
        {/* Pot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] z-10 text-center">
          <div className="bg-black/50 rounded-lg px-4 py-2">
            <p className="text-white text-lg font-bold">{currency}{formatCurrency(pot)}</p>
            <p className="text-yellow-400 text-xs">Total Pot</p>
          </div>
        </div>

        {/* Community Cards */}
        <CommunityCards cards={communityCards} phase={gamePhase} highlightedCards={userHandCards} />

        {/* Opponent Players */}
        {otherPlayers.map((player, index) => (
            <div key={player.id} className="absolute" style={positions[index + 1]}>
                <Player player={player} isUser={false} isActive={players[activePlayerIndex]?.id === player.id} currency={currency} formatCurrency={formatCurrency} godModeActive={isGodMode} gamePhase={gamePhase} />
            </div>
        ))}
        
        {/* User Player */}
        {userPlayer && (
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2">
             <Player player={userPlayer} isUser={true} isActive={players[activePlayerIndex]?.id === userPlayer.id} currency={currency} formatCurrency={formatCurrency} godModeActive={isGodMode} gamePhase={gamePhase} />
          </div>
        )}

         {/* Game Log/Winner Info */}
        {log.length > 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 p-4 rounded-xl shadow-lg text-center animate-fade-in">
                <p className="text-xl font-bold text-yellow-400">{log[log.length-1]}</p>
            </div>
        )}
      </div>

       {/* Action Controls */}
        {userPlayer && (
             <ActionControls 
                player={userPlayer}
                isActive={players[activePlayerIndex]?.id === userPlayer.id}
                onAction={dispatchPlayerAction}
                currentBet={state.currentBet}
                smallBlind={state.smallBlind}
                currency={currency}
                formatCurrency={formatCurrency}
             />
        )}
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onActivateGodMode={() => setIsGodMode(true)}
      />

    </div>
  );
};

export default GameTable;