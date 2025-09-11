import React, { useContext } from 'react';
import { Player as PlayerType, Card as CardType, GameStage } from '../types';
import Card from './Card';
import { DealerChipIcon } from './Icons';
import { cn } from '@/lib/utils';
import { AssetContext } from '../contexts/AssetContext';


interface PlayerProps {
  player: PlayerType;
  isMainPlayer?: boolean;
  isDealer?: boolean;
  godMode?: boolean;
  cardBackUrl?: string;
  formatDisplayAmount: (amount: number) => string;
  isWinner?: boolean;
  winningHand?: CardType[];
  stage: GameStage;
  amountWon?: number;
  bestHandName?: string;
}

const PlayerAvatar: React.FC<{ player: PlayerType }> = ({ player }) => {
    const initials = player.name.substring(0, 2).toUpperCase();
    
    if (player.photoUrl) {
        return <img src={player.photoUrl} alt={player.name} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-gold-accent object-cover bg-background-light" />;
    }
    
    return (
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-gold-accent bg-background-light flex items-center justify-center">
            <span className="text-sm sm:text-lg font-bold text-text-primary">{initials}</span>
        </div>
    );
};

const PlayerTimer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]" viewBox="0 0 100 100">
      <circle
        className="text-primary-accent/50"
        strokeWidth="3"
        stroke="currentColor"
        fill="transparent"
        r="48"
        cx="50"
        cy="50"
        style={{
          strokeDasharray: 314,
          animation: 'player-timer 15s linear forwards',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
    </svg>
  );
};


const Player: React.FC<PlayerProps> = ({ player, isMainPlayer, isDealer, godMode, cardBackUrl, formatDisplayAmount, isWinner, winningHand = [], stage, amountWon, bestHandName }) => {
    const { assets } = useContext(AssetContext);
    const isFolded = player.isFolded;
    const isActive = player.isActive;

    const showCards = isMainPlayer || godMode || (!isFolded && stage === GameStage.SHOWDOWN);
    const showHand = player.hand && player.hand.length > 0;

    const isCardInWinningHand = (card: CardType) => {
        return winningHand.some(whCard => whCard.rank === card.rank && whCard.suit === card.suit);
    }
    
    const playerStateClasses = cn({
        'opacity-40 grayscale': isFolded,
        'scale-105 z-10': isActive,
        'transition-all duration-300': true,
    });

    return (
        <div className={`relative flex flex-col items-center ${isMainPlayer ? 'w-24 sm:w-32' : 'w-16 sm:w-24'} ${playerStateClasses}`}>
            {isWinner && <div className="absolute -inset-2 animate-firework rounded-full pointer-events-none" />}
            
            {isMainPlayer && bestHandName && (
                <div className="absolute top-0 -translate-y-full mb-1 bg-black/70 backdrop-blur-sm text-gold-accent px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-fade-in whitespace-nowrap">
                    {bestHandName}
                </div>
            )}

            {/* 1. Cards */}
            <div className={`relative flex items-end justify-center h-10 sm:h-16 ${isMainPlayer ? '' : 'transform scale-90 -mb-2'}`}>
                {showHand && !isFolded && (
                    <div className={`flex items-center ${isMainPlayer ? '-space-x-8 sm:-space-x-12' : '-space-x-6'}`}>
                        {player.hand?.[0] && (
                            <div className="transform -rotate-12">
                                <Card 
                                    card={player.hand[0]} 
                                    revealed={showCards}
                                    overrideBackUrl={cardBackUrl}
                                    isHighlighted={isWinner && showCards && isCardInWinningHand(player.hand[0])}
                                    size={isMainPlayer ? 'normal' : 'small'}
                                />
                            </div>
                        )}
                        {player.hand?.[1] && (
                            <div className="transform rotate-12">
                                <Card 
                                    card={player.hand[1]} 
                                    revealed={showCards}
                                    overrideBackUrl={cardBackUrl}
                                    isHighlighted={isWinner && showCards && isCardInWinningHand(player.hand[1])}
                                    size={isMainPlayer ? 'normal' : 'small'}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Avatar & Info Bubble (pulled up to overlap cards) */}
            <div className="relative flex flex-col items-center -mt-5 sm:-mt-8 w-full">
                <div className="relative z-10">
                    <div className="relative">
                        <PlayerAvatar player={player} />
                        <PlayerTimer isActive={isActive && !isFolded} />
                    </div>
                    {isDealer && (
                        <div className="absolute -top-1 -right-2 text-white transform-gpu animate-pulse">
                            <DealerChipIcon className="w-6 h-6 bg-white text-black rounded-full p-0.5 shadow-lg" />
                        </div>
                    )}
                </div>

                <div className={cn(
                    "w-full max-w-[120px] bg-surface/80 backdrop-blur-sm border rounded-lg px-2 sm:px-3 py-1 text-center -mt-4 sm:-mt-6 shadow-lg",
                    isWinner ? 'border-gold-accent shadow-glow-gold' : 'border-brand-border',
                    isActive ? 'border-primary-accent' : 'border-brand-border'
                )}>
                    <p className="text-xs sm:text-sm font-bold truncate pt-4 sm:pt-6">{player.name}</p>
                    <p className={`text-sm sm:text-base font-mono ${player.stack > 0 ? 'text-white' : 'text-danger'}`}>{formatDisplayAmount(player.stack)}</p>
                </div>
            </div>

            {/* 3. Bet Chip Stack */}
            {player.bet > 0 && !isFolded && (
                 <div className="absolute bottom-[-24px] flex flex-col items-center">
                    <div className="relative w-8 h-8">
                        <img src={assets.iconPokerChip} alt="chip" className="w-full h-full text-gold-accent"/>
                    </div>
                    <div className="bg-black/70 border border-gold-accent text-gold-accent px-2 py-0.5 rounded-full text-xs font-mono shadow-md -mt-3">
                        {formatDisplayAmount(player.bet)}
                    </div>
                </div>
            )}
            
            {/* Overlays */}
            {amountWon && amountWon > 0 && (
                <div className="absolute top-1/2 -translate-y-1/2 text-success font-bold text-sm animate-prize-up whitespace-nowrap">
                    + {formatDisplayAmount(amountWon)}
                </div>
            )}
             {isWinner && (
                <div className="absolute bg-gold-accent text-black px-2 py-0.5 rounded-md text-xs font-bold shadow-lg uppercase tracking-wider z-20" style={{top: '30%'}}>
                    WINNER
                </div>
            )}
        </div>
    );
};

export default Player;