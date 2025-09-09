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

// Defines 9 seat positions around the oval table, starting from bottom-center (user).
const playerSeatPositions = [
  { bottom: 'calc(0% - 6rem)', left: '50%' }, // Seat 0 (User)
  { bottom: '12%', left: '18%' },               // Seat 1
  { top: '50%', left: '5%', transform: 'translateY(-50%)' },  // Seat 2
  { top: '18%', left: '25%' },                // Seat 3
  { top: 'calc(0% - 1rem)', left: '50%' },      // Seat 4 (Top center)
  { top: '18%', right: '25%' },               // Seat 5
  { top: '50%', right: '5%', transform: 'translateY(-50%)' }, // Seat 6
  { bottom: '12%', right: '18%' },              // Seat 7
  { bottom: '5%', right: '25%'},             // Seat 8 - Fallback
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
            if (!parsedSettings.cardBackUrl) {
                parsedSettings.cardBackUrl = assets.cardBackUrl;
            }
            setUserSettings(parsedSettings);
        } else {
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
          <div className="w-screen h-screen bg-background-dark flex flex-col items-center justify-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-accent"></div>
              <p className="mt-4 text-xl tracking-wider">{!isConnected ? "Connecting..." : "Joining Table..."}</p>
          </div>
      );
  }

  const { players, communityCards, pot, activePlayerIndex, gamePhase, log, bigBlind } = state;

  const userPlayer = players.find(p => p.id === userId);
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
    <div className="w-screen h-screen bg-background-dark flex flex-col items-center justify-center p-2 overflow-hidden font-sans bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface/80 via-background-light to-background-dark">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-20">
            <button onClick={onExit} className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-text-secondary hover:text-white transition-colors">
                <ExitIcon className="w-6 h-6" />
            </button>
            <div className="text-center bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-lg border border-brand-border/50">
                <p className="text-sm font-bold text-primary-accent">{table.name}</p>
                <p className="text-xs text-text-secondary">Stakes: {currency}{table.stakes.small}/{currency}{table.stakes.big}</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-text-secondary hover:text-white transition-colors">
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>

      <div 
        className="relative w-[95vw] h-[60vh] max-w-4xl max-h-[600px] bg-green-900 border-[16px] border-[#3a2a1a] rounded-[50%] shadow-2xl flex items-center justify-center bg-cover bg-center shadow-[0_0_35px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)]"
        style={{ backgroundImage: `url(${assets.tableBackgroundUrl})`}}
       >
        <div className="absolute w-[calc(100%-60px)] h-[calc(100%-60px)] border-2 border-yellow-700/30 rounded-[50%]"></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center flex flex-col items-center space-y-2">
           <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-1 border border-brand-border/50">
             <p className="text-gold-accent text-xs uppercase tracking-wider">Total Pot</p>
             <p className="text-white text-lg font-bold tracking-wider">{formatDisplayAmount(pot)}</p>
           </div>
           
           <div className="h-24 flex items-center">
             <CommunityCards cards={communityCards} phase={gamePhase} highlightedCards={userHandCards} />
           </div>

           <div className="text-center text-white font-semibold text-xs bg-black/50 px-3 py-1 rounded-full">
                <span>NLHE | {formatDisplayAmount(table.stakes.small)}/{formatDisplayAmount(table.stakes.big)}</span>
                <span className="text-text-secondary"> (Practice)</span>
            </div>
        </div>

        {/* Players */}
        {players.map((player) => {
            const style = player.id === userId
                ? playerSeatPositions[0]
                : playerSeatPositions[player.position] || playerSeatPositions[8];
            return (
                <div key={player.id} className="absolute" style={{ ...style, transform: `${style.transform || ''} translateX(-50%)` }}>
                    <Player
                        player={player}
                        isUser={player.id === userId}
                        isActive={players[activePlayerIndex]?.id === player.id}
                        formatDisplayAmount={formatDisplayAmount}
                        godModeActive={isGodMode}
                        gamePhase={gamePhase}
                        overrideCardBackUrl={player.id === userId ? userSettings.cardBackUrl : undefined}
                    />
                </div>
            )
        })}

        {gamePhase === GamePhase.SHOWDOWN && log.length > 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 p-4 rounded-xl shadow-lg text-center animate-fade-in border border-gold-accent">
                <p className="text-xl font-bold text-gold-accent">{log[log.length-1]}</p>
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
