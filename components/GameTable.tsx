import React, { useState, useMemo, useContext } from 'react';
import { TableConfig, GameMode, GameStage, Card as CardType } from '../types';
import usePokerGame from '../hooks/usePokerGame';
import Player from './Player';
import CommunityCards from './CommunityCards';
import ActionControls from './ActionControls';
import SettingsModal from './SettingsModal';
import WinnerAnnouncement from './WinnerAnnouncement';
import { ExitIcon, SettingsIcon } from './Icons';
import { AssetContext } from '../contexts/AssetContext';
import { evaluatePlayerHand } from '../utils/pokerEvaluator';

interface GameTableProps {
  table: TableConfig;
  onExit: () => void;
}

const PotDisplay: React.FC<{ amount: number; format: (amount: number) => string }> = ({ amount, format }) => (
    <div className="flex flex-col items-center text-center -translate-y-2 sm:-translate-y-4">
        <p className="text-sm font-bold text-gold-accent uppercase tracking-wider">Pot</p>
        <p className="text-xl sm:text-2xl font-bold text-white font-mono drop-shadow-lg">{format(amount)}</p>
    </div>
);

const getOpponentPositions = (numOpponents: number) => {
    const positions: React.CSSProperties[] = [];
    if (numOpponents === 0) return positions;

    const radiusX = 38; // Was 65, adjusted to fit on smaller screens
    const radiusY = 35; // Was 55, adjusted for a more circular feel and to prevent vertical overflow
    const centerX = 50;
    const centerY = 55; // Was 45, pushed down to prevent top players from being cut off
    
    // Distribute opponents over the top ~200 degrees of the oval
    const totalAngle = (200 * Math.PI) / 180;
    const angleOffset = -Math.PI / 2 - totalAngle / 2;

    for (let i = 0; i < numOpponents; i++) {
        // Space them evenly across the arc. If only one, place at top center.
        const ratio = numOpponents > 1 ? i / (numOpponents - 1) : 0.5;
        const angle = angleOffset + ratio * totalAngle;
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        positions.push({ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' });
    }
    return positions;
};


const GameTable: React.FC<GameTableProps> = ({ table, onExit }) => {
    const { assets } = useContext(AssetContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showInBB, setShowInBB] = useState(false);
    const [godMode, setGodMode] = useState(false);
    const [customCardBack, setCustomCardBack] = useState<string | undefined>(undefined);

    const { state, dispatchPlayerAction, isConnected, userId } = usePokerGame(table.id, 1000, table.maxPlayers, table.stakes.small, table.stakes.big);
    
    const mainPlayer = useMemo(() => state?.players.find(p => p.id === userId), [state?.players, userId]);
    const opponents = useMemo(() => state?.players.filter(p => p.id !== userId) || [], [state?.players, userId]);
    const mainPlayerIndex = useMemo(() => state?.players.findIndex(p => p.id === userId) ?? -1, [state?.players, userId]);

    const opponentPositions = useMemo(() => getOpponentPositions(opponents.length), [opponents.length]);

    const bestHand = useMemo(() => {
        if (!mainPlayer || !mainPlayer.hand || !state || state.communityCards.length < 3) {
            return null;
        }
        return evaluatePlayerHand(mainPlayer.hand, state.communityCards);
    }, [mainPlayer, state?.communityCards]);

    const highlightedCards: CardType[] = useMemo(() => {
        if (state?.stage !== GameStage.SHOWDOWN || !state.winners) return [];
        return state.winners.flatMap(winner => winner.winningHand);
    }, [state]);
    
    const formatDisplayAmount = (amount: number) => {
        if (showInBB) return `${(amount / table.stakes.big).toFixed(1)} BB`;
        return table.mode === GameMode.REAL_MONEY ? `${amount.toFixed(2)}` : `$${amount.toLocaleString()}`;
    };

    if (!isConnected && !state) {
        return (
            <div className="w-full h-full bg-background-dark flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-accent"></div>
                <p className="mt-4 text-xl tracking-wider">Connecting to table...</p>
            </div>
        );
    }

    if (!state) {
        return <div className="w-full h-full bg-background-dark flex items-center justify-center text-white">Waiting for game state...</div>;
    }

  return (
    <div className="relative w-full h-full bg-cover bg-center text-white overflow-hidden flex flex-col" style={{ backgroundImage: `url(${assets.tableBackgroundUrl})`}}>
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Header */}
        <header className="relative z-20 w-full flex justify-between items-start p-2 sm:p-4">
            <button onClick={onExit} className="flex items-center space-x-2 px-3 py-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors text-sm shadow-lg"><ExitIcon/><span>Lobby</span></button>
            <div className="text-center bg-black/60 px-4 py-1 rounded-b-lg shadow-lg">
                <h1 className="text-lg font-bold">{table.name}</h1>
                <p className="text-xs text-text-secondary">{table.mode === GameMode.REAL_MONEY ? 'Real Money' : 'Play Money'} - {formatDisplayAmount(table.stakes.small)}/{formatDisplayAmount(table.stakes.big)}</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors shadow-lg"><SettingsIcon/></button>
        </header>

        {/* Main Game Area */}
        <main className="relative flex-grow flex items-center justify-center min-h-0">
          <div className="relative w-full h-full max-h-[calc(100vw*0.6)] sm:max-h-full max-w-full sm:max-w-[120vh] aspect-[16/10]">
              
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[95%] h-[95%]">
                      {/* Table Railing */}
                      <div className="absolute inset-0 bg-yellow-900/80 rounded-full shadow-2xl" />
                      {/* Table Felt */}
                      <div className="absolute inset-[3%] sm:inset-[4%] poker-felt rounded-full shadow-inner" />
                      {/* Inner Line */}
                      <div className="absolute inset-[4%] sm:inset-[5%] border-2 border-yellow-700/50 rounded-full pointer-events-none" />
                  </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-max z-10">
                  <CommunityCards cards={state.communityCards} stage={state.stage} winningHand={highlightedCards} />
                  {state.pot > 0 && <PotDisplay amount={state.pot} format={formatDisplayAmount} />}
              </div>

              {opponents.map((player, index) => {
                  const playerIndexInFullList = state.players.findIndex(p => p.id === player.id);
                  const pos = opponentPositions[index];
                  const winnerInfo = state.winners?.find(w => w.playerId === player.id);
                  return (
                      <div key={player.id} className="absolute z-20" style={pos}>
                          <Player 
                              player={player} 
                              isDealer={playerIndexInFullList === state.dealerIndex} 
                              isMainPlayer={false} 
                              godMode={godMode} 
                              formatDisplayAmount={formatDisplayAmount} 
                              cardBackUrl={customCardBack}
                              isWinner={!!winnerInfo}
                              winningHand={highlightedCards}
                              stage={state.stage}
                              amountWon={winnerInfo?.amountWon}
                          />
                      </div>
                  );
              })}

              {mainPlayer && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[28%] sm:translate-y-[20%] z-20">
                       <Player 
                          player={mainPlayer} 
                          isDealer={mainPlayerIndex === state.dealerIndex}
                          isMainPlayer={true}
                          godMode={godMode} 
                          formatDisplayAmount={formatDisplayAmount} 
                          cardBackUrl={customCardBack}
                          isWinner={!!state.winners?.some(w => w.playerId === mainPlayer.id)}
                          winningHand={highlightedCards}
                          stage={state.stage}
                          amountWon={state.winners?.find(w => w.playerId === mainPlayer.id)?.amountWon}
                          bestHandName={bestHand?.name}
                       />
                  </div>
              )}
          </div>
        </main>

        <footer className="relative z-20 w-full flex flex-col items-center p-2">
            <div className="h-[96px] w-full flex items-center justify-center">
                {mainPlayer && <ActionControls 
                    player={mainPlayer} 
                    isActive={state.players[state.activePlayerIndex]?.id === mainPlayer.id} 
                    onAction={dispatchPlayerAction}
                    currentBet={state.currentBet}
                    pot={state.pot}
                    smallBlind={table.stakes.small}
                    bigBlind={table.stakes.big}
                    formatDisplayAmount={formatDisplayAmount}
                 />}
            </div>
        </footer>

        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onActivateGodMode={() => setGodMode(true)}
            isAdmin={userId === '7327258482'}
            onSettingsChange={(settings) => {
                if (settings.showInBB !== undefined) setShowInBB(settings.showInBB);
                if (settings.cardBackUrl) setCustomCardBack(settings.cardBackUrl);
            }}
        />
        
         {state.stage === GameStage.SHOWDOWN && state.winners && state.winners.length > 0 && 
            <WinnerAnnouncement winners={state.winners} />
         }
    </div>
  );
};

export default GameTable;