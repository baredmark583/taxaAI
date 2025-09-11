import React, { useState, useMemo, useContext } from 'react';
import { TableConfig, GameMode, GameStage, Card as CardType, Player as PlayerType } from '../types';
import usePokerGame from '../hooks/usePokerGame';
import Player from './Player';
import CommunityCards from './CommunityCards';
import ActionControls from './ActionControls';
import SettingsModal from './SettingsModal';
import WinnerAnnouncement from './WinnerAnnouncement';
import { AssetContext } from '../contexts/AssetContext';
import { evaluatePlayerHand } from '../utils/pokerEvaluator';

const UrlIcon = ({ src, className }: { src: string; className?: string }) => {
  if (!src) return <div className={className} />;
  return (
    <div
      className={`icon-mask ${className}`}
      style={{ '--icon-url': `url(${src})` } as React.CSSProperties}
    />
  );
};

const EmptySeat: React.FC = () => (
  <div className="w-20 h-24 sm:w-24 sm:h-28 flex flex-col items-center justify-center flex-shrink-0">
    <div className="w-16 h-20 sm:w-20 sm:h-24 bg-black/20 rounded-lg flex items-center justify-center text-text-secondary/50 text-xs sm:text-sm">
      Место
    </div>
  </div>
);

interface GameTableProps {
  table: TableConfig;
  onExit: () => void;
}

const PotDisplay: React.FC<{ amount: number; format: (amount: number) => string }> = ({ amount, format }) => (
  <div className="flex flex-col items-center text-center my-2 bg-black/30 px-3 sm:px-4 py-1 rounded-full">
    <p className="text-base sm:text-lg font-bold text-gold-accent font-mono drop-shadow-lg">
      Pot: {format(amount)}
    </p>
  </div>
);

const GameTable: React.FC<GameTableProps> = ({ table, onExit }) => {
  const { assets } = useContext(AssetContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showInBB, setShowInBB] = useState(false);
  const [godMode, setGodMode] = useState(false);
  const [customCardBack, setCustomCardBack] = useState<string | undefined>(undefined);

  const { state, dispatchPlayerAction, isConnected, userId } = usePokerGame(table.id, 1000, table.maxPlayers, table.stakes.small, table.stakes.big);
  
  const mainPlayer = useMemo(() => state?.players.find(p => p.id === userId), [state?.players, userId]);

  const { topRowPlayers, bottomRowPlayers } = useMemo(() => {
    if (!state || !userId) return { topRowPlayers: [], bottomRowPlayers: [] };
    const mainPlayerIndex = state.players.findIndex(p => p.id === userId);
    if (mainPlayerIndex === -1) return { topRowPlayers: [], bottomRowPlayers: [] };

    const reorderedPlayers = [
      ...state.players.slice(mainPlayerIndex),
      ...state.players.slice(0, mainPlayerIndex)
    ];
    const opponents = reorderedPlayers.slice(1);

    const maxOpponents = table.maxPlayers - 1;
    const topSeatsCount = Math.ceil(maxOpponents / 2);

    return {
      topRowPlayers: opponents.slice(0, topSeatsCount),
      bottomRowPlayers: opponents.slice(topSeatsCount)
    };
  }, [state, userId, table.maxPlayers]);

  const bestHand = useMemo(() => {
    if (!mainPlayer || !mainPlayer.hand || !state || state.communityCards.length < 3) return null;
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
        <p className="mt-4 text-lg sm:text-xl tracking-wider">Connecting to table...</p>
      </div>
    );
  }

  if (!state) {
    return <div className="w-full h-full bg-background-dark flex items-center justify-center text-white">Waiting for game state...</div>;
  }

  const renderPlayer = (player: PlayerType) => {
    const winnerInfo = state.winners?.find(w => w.playerId === player.id);
    return (
      <div key={player.id} className="flex-shrink-0 min-w-0">
        <Player 
          player={player} 
          isDealer={state.players[state.dealerIndex]?.id === player.id} 
          isMainPlayer={player.id === userId}
          godMode={godMode} 
          formatDisplayAmount={formatDisplayAmount} 
          cardBackUrl={customCardBack}
          isWinner={!!winnerInfo}
          winningHand={highlightedCards}
          stage={state.stage}
          amountWon={winnerInfo?.amountWon}
          bestHandName={player.id === userId ? bestHand?.name : undefined}
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-background-dark text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="relative z-20 w-full flex justify-between items-center p-2 text-xs flex-shrink-0">
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
      
      <main className="relative flex-grow flex flex-col items-center justify-between p-2 gap-2">
        {/* Top Row */}
        <div className="w-full flex flex-wrap justify-center items-start gap-2">
          {topRowPlayers.map(renderPlayer)}
        </div>

        {/* Middle Section */}
        <div className="flex flex-col items-center justify-center gap-2">
          {state.pot > 0 && <PotDisplay amount={state.pot} format={formatDisplayAmount} />}
          <CommunityCards cards={state.communityCards} stage={state.stage} winningHand={highlightedCards} />
        </div>

        {/* Bottom Row */}
        <div className="w-full flex flex-wrap justify-center items-end gap-2">
          {bottomRowPlayers.map(renderPlayer)}
          {mainPlayer && renderPlayer(mainPlayer)}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-20 w-full flex items-center justify-center p-2 h-[80px] flex-shrink-0">
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

      {/* Modals */}
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
