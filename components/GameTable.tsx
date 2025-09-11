import React, { useState, useMemo, useContext } from 'react';
import { TableConfig, GameMode, GameStage, Card as CardType } from '../types';
import usePokerGame from '../hooks/usePokerGame';
import Player from './Player';
import CommunityCards from './CommunityCards';
import ActionControls from './ActionControls';
import SettingsModal from './SettingsModal';
import WinnerAnnouncement from './WinnerAnnouncement';
import { AssetContext } from '../contexts/AssetContext';
import { evaluatePlayerHand } from '../utils/pokerEvaluator';

const UrlIcon = ({ src, className }: { src: string; className?: string }) => {
  if (!src) return <div className={className} />; // Return an empty div if src is missing
  return (
    <div
      className={`icon-mask ${className}`}
      style={{ '--icon-url': `url(${src})` } as React.CSSProperties}
    />
  );
};

// New component for an empty seat placeholder
const SeatPlaceholder: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div
        style={style}
        className="absolute w-20 h-20 rounded-full bg-black/20 border-2 border-dashed border-surface flex items-center justify-center text-text-secondary text-xs opacity-50"
    >
        <span>Место</span>
    </div>
);


interface GameTableProps {
  table: TableConfig;
  onExit: () => void;
}

const PotDisplay: React.FC<{ amount: number; format: (amount: number) => string }> = ({ amount, format }) => (
    <div className="flex flex-col items-center text-center my-2">
        <p className="text-xl sm:text-2xl font-bold text-white font-mono drop-shadow-lg">
          Pot: {format(amount)}
        </p>
    </div>
);

// Pre-defined percentage-based positions for up to 8 opponents
const opponentSeatPositions = [
    { top: '50%', left: '5%', transform: 'translate(-50%, -50%)' },
    { top: '22%', left: '20%', transform: 'translate(-50%, -50%)' },
    { top: '10%', left: '40%', transform: 'translate(-50%, -50%)' },
    { top: '10%', left: '60%', transform: 'translate(-50%, -50%)' },
    { top: '22%', left: '80%', transform: 'translate(-50%, -50%)' },
    { top: '50%', left: '95%', transform: 'translate(-50%, -50%)' },
    { top: '78%', left: '80%', transform: 'translate(-50%, -50%)' },
    { top: '78%', left: '20%', transform: 'translate(-50%, -50%)' },
];


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
        if (table.mode === GameMode.REAL_MONEY) return `${amount.toFixed(2)}`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}k`;
        return `$${amount}`;
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
    <div className="relative w-full h-full bg-cover bg-center text-white overflow-hidden flex flex-col" style={{ backgroundImage: `url(${assets.tableBackgroundUrl})` }}>
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Header */}
        <header className="relative z-20 w-full flex justify-between items-center p-2 sm:p-4 text-xs">
             <div className="flex-1 text-left">
                <button onClick={onExit} className="flex items-center space-x-2 px-3 py-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors shadow-lg">
                    <UrlIcon src={assets.iconExit} className="w-4 h-4"/>
                    <span>Lobby</span>
                </button>
            </div>
            <div className="flex-1 text-center bg-black/40 px-3 py-1 rounded-lg shadow-lg">
                <h1 className="font-bold text-sm truncate">{table.name}</h1>
                <p className="text-text-secondary">{table.mode === GameMode.PLAY_MONEY ? 'Play Money' : 'Real Money'} - {formatDisplayAmount(table.stakes.small)}/{formatDisplayAmount(table.stakes.big)}</p>
            </div>
            <div className="flex-1 text-right">
                 <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors shadow-lg">
                    <UrlIcon src={assets.iconSettings} className="w-5 h-5"/>
                 </button>
            </div>
        </header>
        
        <main className="relative flex-grow flex flex-col items-center justify-center p-2">
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative w-full max-w-5xl aspect-[2/1] border-4 border-gold-accent/20 rounded-[100px] bg-green-900/40 shadow-2xl">
                    
                    {/* Render Seats and Opponents */}
                    {Array.from({ length: Math.min(table.maxPlayers - 1, opponentSeatPositions.length) }).map((_, seatIndex) => {
                        const opponent = opponents[seatIndex];
                        const style = opponentSeatPositions[seatIndex];

                        if (opponent) {
                            const playerIndexInFullList = state.players.findIndex(p => p.id === opponent.id);
                            const winnerInfo = state.winners?.find(w => w.playerId === opponent.id);
                             return (
                                <div key={opponent.id} className="absolute" style={style}>
                                     <Player 
                                          player={opponent} 
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
                        } else {
                            return <SeatPlaceholder key={`seat-${seatIndex}`} style={style} />;
                        }
                    })}
                   

                    {/* Middle Section: Community Cards & Pot */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                        {state.pot > 0 && <PotDisplay amount={state.pot} format={formatDisplayAmount} />}
                        <CommunityCards cards={state.communityCards} stage={state.stage} winningHand={highlightedCards} />
                    </div>

                    {/* Main Player at the bottom */}
                    {mainPlayer && (
                         <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2">
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
            </div>
        </main>
        
        {/* Action Controls Footer */}
        <footer className="relative z-20 w-full flex items-center justify-center p-2 h-[80px]">
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
        </footer>
        
        {/* Modals and Overlays */}
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