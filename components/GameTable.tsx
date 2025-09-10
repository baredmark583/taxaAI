
import React, { useState, useMemo, useContext } from 'react';
import { TableConfig, GameMode, GameStage, Card as CardType } from '../types';
import usePokerGame from '../hooks/usePokerGame';
import Player from './Player';
import CommunityCards from './CommunityCards';
import ActionControls from './ActionControls';
import SettingsModal from './SettingsModal';
import WinnerAnnouncement from './WinnerAnnouncement';
// FIX: Import the newly added SettingsIcon.
import { ExitIcon, SettingsIcon } from './Icons';
import { AssetContext } from '../contexts/AssetContext';

interface GameTableProps {
  table: TableConfig;
  onExit: () => void;
}

const getPlayerPositions = (numPlayers: number) => {
    const positions: React.CSSProperties[] = [];
    const radiusX = 45; // percentage
    const radiusY = 38; // percentage
    const centerX = 50;
    const centerY = 55;
    const angleOffset = -Math.PI / 2;

    for (let i = 0; i < numPlayers; i++) {
        const angle = angleOffset + (i / numPlayers) * 2 * Math.PI;
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
    
    const playerPositions = useMemo(() => getPlayerPositions(table.maxPlayers), [table.maxPlayers]);
    
    const formatDisplayAmount = (amount: number) => {
        if (showInBB) return `${(amount / table.stakes.big).toFixed(1)} BB`;
        return table.mode === GameMode.REAL_MONEY ? `${amount.toFixed(2)}` : `$${amount.toLocaleString()}`;
    };

    const mainPlayer = state?.players.find(p => p.id === userId);

    const highlightedCards: CardType[] = useMemo(() => {
        if (state?.stage !== GameStage.SHOWDOWN || !state.winners) return [];
        return state.winners.flatMap(winner => winner.winningHand);
    }, [state]);

    if (!isConnected && !state) {
        return (
            <div className="w-screen h-screen bg-background-dark flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-accent"></div>
                <p className="mt-4 text-xl tracking-wider">Connecting to table...</p>
            </div>
        );
    }

    if (!state) {
        return <div className="w-screen h-screen bg-background-dark flex items-center justify-center text-white">Waiting for game state...</div>;
    }

  return (
    <div className="w-screen h-screen bg-cover bg-center text-white overflow-hidden" style={{ backgroundImage: `url(${assets.tableBackgroundUrl})`}}>
        <div className="absolute inset-0 bg-black/50">
            <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-4">
                <div className="w-full flex justify-between items-start">
                     <button onClick={onExit} className="flex items-center space-x-2 px-3 py-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors text-sm"><ExitIcon/><span>Lobby</span></button>
                    <div className="text-center bg-black/50 px-4 py-1 rounded-b-lg">
                        <h1 className="text-lg font-bold">{table.name}</h1>
                        <p className="text-xs text-text-secondary">{table.mode === GameMode.REAL_MONEY ? 'Real Money' : 'Play Money'} - {formatDisplayAmount(table.stakes.small)}/{formatDisplayAmount(table.stakes.big)}</p>
                    </div>
                     <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors"><SettingsIcon/></button>
                </div>

                <div className="relative w-[85vw] h-[45vh] sm:w-[70vw] sm:h-[40vh] border-4 border-yellow-800/50 bg-green-900/70 rounded-full">
                     {state.players.map((player, index) => {
                         const pos = playerPositions[index % table.maxPlayers];
                         const winnerInfo = state.winners?.find(w => w.playerId === player.id);
                         return (
                            <div key={player.id} className="absolute" style={pos}>
                                <Player 
                                    player={player} 
                                    isDealer={index === state.dealerIndex} 
                                    isMainPlayer={player.id === userId} 
                                    godMode={godMode} 
                                    formatDisplayAmount={formatDisplayAmount} 
                                    cardBackUrl={customCardBack}
                                    isWinner={!!winnerInfo}
                                    winningHand={highlightedCards}
                                    stage={state.stage}
                                    amountWon={winnerInfo?.amountWon}
                                />
                            </div>
                         )
                     })}
                     
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <CommunityCards cards={state.communityCards} stage={state.stage} winningHand={highlightedCards} />
                        <p className="text-lg font-bold bg-black/50 px-3 py-1 rounded-full">Pot: {formatDisplayAmount(state.pot)}</p>
                    </div>
                </div>
                
                <div className="w-full flex flex-col items-center">
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
        </div>
    </div>
  );
};

export default GameTable;