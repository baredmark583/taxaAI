import React, { useContext } from 'react';
import { Player as PlayerType, Card as CardType, GameStage } from '../types';
import Card from './Card';
import { cn } from '@/lib/utils';
import { AssetContext } from '../contexts/AssetContext';

const UrlIcon = ({ src, className }: { src: string; className?: string }) => {
  if (!src) return <div className={className} />;
  return (
    <div
      className={`icon-mask ${className}`}
      style={{ '--icon-url': `url(${src})` } as React.CSSProperties}
    />
  );
};

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
    const initials = player.name.substring(0, 1).toUpperCase();
    
    return (
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-background-light flex items-center justify-center border-2 border-brand-border">
            {player.photoUrl ? (
                <img src={player.photoUrl} alt={player.name} className="w-full h-full rounded-full object-cover" />
            ) : (
                <span className="text-xl sm:text-2xl font-bold text-text-primary">{initials}</span>
            )}
        </div>
    );
};

const PlayerTimer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-accent/30 rounded-full overflow-hidden">
        <div className="h-full bg-primary-accent animate-progress-bar" style={{ animationDuration: '15s' }}></div>
    </div>
  );
};


const Player: React.FC<PlayerProps> = ({ player, isMainPlayer, isDealer, godMode, cardBackUrl, formatDisplayAmount, isWinner, winningHand = [], stage, amountWon, bestHandName }) => {
    const { assets } = useContext(AssetContext);
    const isFolded = player.isFolded;
    const isActive = player.isActive;
    const isSittingOut = player.isSittingOut;

    const showCards = isMainPlayer || godMode || (!isFolded && stage === GameStage.SHOWDOWN);
    const showHand = player.hand && player.hand.length > 0;

    const isCardInWinningHand = (card: CardType) => {
        return winningHand.some(whCard => whCard.rank === card.rank && whCard.suit === card.suit);
    }
    
    const playerStateClasses = cn({
        'opacity-50 grayscale': isFolded || isSittingOut,
        'transition-all duration-300': true,
    });

    return (
        <div className={cn("relative flex flex-col items-center w-24 h-40 justify-end", playerStateClasses)}>
            
            {bestHandName && stage !== GameStage.SHOWDOWN && (
                <div className="absolute top-0 bg-black/70 backdrop-blur-sm text-gold-accent px-2 py-0.5 rounded-full text-xs font-semibold shadow-lg animate-fade-in whitespace-nowrap">
                    {bestHandName}
                </div>
            )}
            
            <div className={cn(
                "w-full bg-surface backdrop-blur-sm rounded-lg p-1 text-center shadow-lg relative",
                isActive ? 'ring-2 ring-primary-accent' : ''
            )}>
                 <p className="text-xs sm:text-sm font-bold truncate h-4">{player.name}</p>
                 <div className="my-1">
                    <PlayerAvatar player={player} />
                 </div>
                <p className={`text-sm font-mono h-5 ${player.stack > 0 ? 'text-white' : 'text-danger'}`}>{formatDisplayAmount(player.stack)}</p>
                <PlayerTimer isActive={isActive} />
            </div>

            {showHand && !isFolded && !isSittingOut && (
                 <div className="flex items-center justify-center z-10 -mt-3">
                    <div className="-mr-8 transform -rotate-12">
                        <Card 
                            card={player.hand[0]} 
                            revealed={showCards}
                            overrideBackUrl={cardBackUrl}
                            isHighlighted={isWinner && showCards && isCardInWinningHand(player.hand[0])}
                            size='small'
                        />
                    </div>
                    <div className="transform rotate-12">
                        <Card 
                            card={player.hand[1]} 
                            revealed={showCards}
                            overrideBackUrl={cardBackUrl}
                            isHighlighted={isWinner && showCards && isCardInWinningHand(player.hand[1])}
                            size='small'
                        />
                    </div>
                </div>
            )}
            
            {isDealer && (
                <div className="absolute top-2 right-2 text-white transform-gpu animate-pulse">
                     <UrlIcon src={assets.iconDealerChip} className="w-5 h-5"/>
                </div>
            )}

            {player.bet > 0 && !isFolded && (
                 <div className="absolute top-full -mt-2 flex flex-col items-center z-20">
                    <div className="bg-black/70 border border-gold-accent text-gold-accent px-2 py-0.5 rounded-full text-xs font-mono shadow-md">
                        {formatDisplayAmount(player.bet)}
                    </div>
                </div>
            )}
            
            {amountWon && amountWon > 0 && (
                <div className="absolute top-1/2 -translate-y-1/2 text-success font-bold text-lg animate-prize-up whitespace-nowrap">
                    + {formatDisplayAmount(amountWon)}
                </div>
            )}
             {isFolded && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-1 text-xs font-bold rounded-md uppercase">
                    Fold
                </div>
             )}
              {isSittingOut && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-1 text-xs font-bold rounded-md uppercase">
                    Ожидание
                </div>
             )}
        </div>
    );
};

export default Player;