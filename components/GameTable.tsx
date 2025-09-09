import React, { useState, useContext, useEffect, useCallback } from 'react';
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
  photo_url?: string;
}

interface UserSettings {
    cardBackUrl: string;
    showInBB: boolean;
}

interface GameTableProps {
  table: TableConfig;
  initialStack: number;
  onExit: () => void;
  isGodMode: boolean;
  setIsGodMode: (active: boolean) => void;
  telegramUser: TelegramUser;
  initData: string;
  isAdmin: boolean;
}

// Positions for up to 8 opponents, starting from user's left and going clockwise.
const opponentPositions = [
    { bottom: '5%', left: '25%', transform: 'translateX(-50%)' },
    { top: '60%', left: '5%', transform: '' },
    { top: '25%', left: '12%', transform: '' },
    { top: '8%', left: '50%', transform: 'translateX(-50%)' },
    { top: '25%', right: '12%', transform: '' },
    { top: '60%', right: '5%', transform: '' },
    { bottom: '5%', right: '25%', transform: 'translateX(50%)' },
];

const GameTable: React.FC<GameTableProps> = ({ table, initialStack, onExit, isGodMode, setIsGodMode, telegramUser, initData, isAdmin }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { assets } = useContext(AssetContext);
  const userId = telegramUser.id.toString();
  const { state, dispatchPlayerAction, isConnected } = usePokerGame(initialStack, table.maxPlayers, table.stakes.small, table.stakes.big, userId, initData);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    cardBackUrl: assets.cardBackUrl,
    showInBB: false,
  });

  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem('pokerUserSettings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            // Make sure the loaded settings include a valid card back url, otherwise keep default
            if (!parsedSettings.cardBackUrl) {
                parsedSettings.cardBackUrl = assets.cardBackUrl;
            }
            setUserSettings(parsedSettings);
        } else {
            // If no settings saved, use the default from assets
            setUserSettings(prev => ({ ...prev, cardBackUrl: assets.cardBackUrl }));
        }
    } catch (error) {
        console.error("Failed to load user settings from localStorage", error);
        setUserSettings(prev => ({ ...prev, cardBackUrl: assets.cardBackUrl }));
    }
  }, [assets.cardBackUrl]);

  const handleSettingsChange = useCallback((newSettings: Partial<UserSettings>) => {
    setUserSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  if (!isConnected || !state) {
      return (
          <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="mt-4 text-xl">{!isConnected ? "Connecting to server..." : "Joining table..."}</p>
          </div>
      );
  }

  const { players, communityCards, pot, activePlayerIndex, gamePhase, log, bigBlind } = state;

  const userPlayer = players.find(p => p.id === userId);
  const otherPlayers = players.filter(p => p.id !== userId);
  const currency = table.mode === GameMode.REAL_MONEY ? 'TON' : '$';
  
  const formatDisplayAmount = (amount: number) => {
    if (userSettings.showInBB && bigBlind > 0) {
      const amountInBB = amount / bigBlind;
      return `${amountInBB.toFixed(1)} BB`;
    }
    if (table.mode === GameMode.REAL_MONEY) {
      return `${amount.toFixed(4)}`;
    }
    return `${amount.toLocaleString()}`;
  };

  const userHandCards = userPlayer?.handResult?.cards || [];

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-2 overflow-hidden font-sans">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-center z-20">
            <button onClick={onExit} className="p-2 bg-black/30 rounded-full text-gray-300 hover:text-white transition-colors">
                <ExitIcon className="w-6 h-6" />
            </button>
            <div className="text-center bg-black/30 px-4 py-1.5 rounded-lg border border-gray-700">
                <p className="text-sm font-bold text-cyan-400">{table.name}</p>
                <p className="text-xs text-gray-400">Stakes: {currency}{table.stakes.small}/{currency}{table.stakes.big}</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-black/30 rounded-full text-gray-300 hover:text-white transition-colors">
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>


      <div 
        className="relative w-[95vw] h-[60vh] max-w-4xl max-h-[600px] bg-green-900 border-[12px] border-gray-800 rounded-[50%] shadow-2xl flex items-center justify-center bg-cover bg-center shadow-[0_0_25px_rgba(0,255,255,0.3)]"
        style={{ backgroundImage: `url(${assets.tableBackgroundUrl})`}}
       >
        <div className="absolute w-[80%] h-[75%] border-2 border-yellow-700/30 rounded-[50%]"></div>
        
        {/* Pot & Game Info */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center flex flex-col items-center space-y-2">
           <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-1 border border-gray-700">
             <p className="text-yellow-400 text-xs uppercase tracking-wider">Total Pot</p>
             <p className="text-white text-lg font-bold">{formatDisplayAmount(pot)}</p>
           </div>
           
           <div className="h-24 flex items-center"> {/* Community cards will be positioned inside this space */}
             <CommunityCards cards={communityCards} phase={gamePhase} highlightedCards={userHandCards} />
           </div>

           <div className="text-center text-white font-semibold text-xs bg-black/40 px-3 py-1 rounded-full">
                <span>NLHE | {formatDisplayAmount(table.stakes.small)}/{formatDisplayAmount(table.stakes.big)}</span>
                <span className="text-gray-400"> (Practice)</span>
            </div>
        </div>


        {/* Opponent Players */}
        {otherPlayers.map((player, index) => (
            <div key={player.id} className="absolute" style={opponentPositions[player.position -1] || opponentPositions[index]}>
                <Player player={player} isUser={false} isActive={players[activePlayerIndex]?.id === player.id} formatDisplayAmount={formatDisplayAmount} godModeActive={isGodMode} gamePhase={gamePhase} />
            </div>
        ))}
        
        {/* User Player */}
        {userPlayer && (
          <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2">
             <Player player={userPlayer} isUser={true} isActive={players[activePlayerIndex]?.id === userPlayer.id} formatDisplayAmount={formatDisplayAmount} godModeActive={isGodMode} gamePhase={gamePhase} overrideCardBackUrl={userSettings.cardBackUrl} />
          </div>
        )}

         {/* Game Log/Winner Info */}
        {gamePhase === GamePhase.SHOWDOWN && log.length > 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 p-4 rounded-xl shadow-lg text-center animate-fade-in border border-yellow-500">
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
                pot={state.pot}
                smallBlind={state.smallBlind}
                bigBlind={state.bigBlind}
                formatDisplayAmount={formatDisplayAmount}
             />
        )}
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onActivateGodMode={() => setIsGodMode(true)}
        isAdmin={isAdmin}
        onSettingsChange={handleSettingsChange}
      />

    </div>
  );
};

export default GameTable;
