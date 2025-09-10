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
import HandStrengthIndicator from './HandStrengthIndicator';


interface GameTableProps {
  table: TableConfig;
  onExit: () => void;
}

const getOpponentPositions = (numOpponents: number) => {
    const positions: React.CSSProperties[] = [];
    if (numOpponents === 0) return positions;

    const radiusX = 65;
    const radiusY = 55;
    const centerX = 50;
    const centerY = 45; // Shift center up slightly
    
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
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Header */}
        <header className="relative z-20 w-full flex justify-between items-start p-2 sm:p-4">
            <button onClick={onExit} className="flex items-center space-x-2 px-3 py-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors text-sm"><ExitIcon/><span>Lobby</span></button>
            <div className="text-center bg-black/50 px-4 py-1 rounded-b-lg">
                <h1 className="text-lg font-bold">{table.name}</h1>
                <p className="text-xs text-text-secondary">{table.mode === GameMode.REAL_MONEY ? 'Real Money' : 'Play Money'} - {formatDisplayAmount(table.stakes.small)}/{formatDisplayAmount(table.stakes.big)}</p>
            </div>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors"><SettingsIcon/></button>
        </header>

        {/* Main Game Area */}
        <main className="relative flex-grow flex items-center justify-center min-h-0">
          <div className="relative w-full h-full max-h-[calc(100vw*0.6)] sm:max-h-full max-w-full sm:max-w-[120vh] aspect-[16/10]">
              <div className="absolute inset-[5%] sm:inset-[10%] border-4 border-yellow-800/50 bg-green-900/70 rounded-full">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-max">
                      <CommunityCards cards={state.communityCards} stage={state.stage} winningHand={highlightedCards} />
                      <p className="text-lg font-bold bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">Pot: {formatDisplayAmount(state.pot)}</p>
                  </div>
              </div>

              {opponents.map((player, index) => {
                  const playerIndexInFullList = state.players.findIndex(p => p.id === player.id);
                  const pos = opponentPositions[index];
                  const winnerInfo = state.winners?.find(w => w.playerId === player.id);
                  return (
                      <div key={player.id} className="absolute" style={pos}>
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
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[28%] sm:translate-y-[20%]">
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
                       />
                  </div>
              )}
          </div>
        </main>

        <footer className="relative z-20 w-full flex flex-col items-center p-2">
            {bestHand && <HandStrengthIndicator handName={bestHand.name} />}
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