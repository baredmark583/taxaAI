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

const PlayerAvatar: React.FC<{ player: PlayerType, isActive: boolean }> = ({ player, isActive }) => {
    const initials = player.name.substring(0, 2).toUpperCase();
    
    return (
        <div className={cn("relative w-16 h-16 rounded-lg bg-background-light flex items-center justify-center border-2", isActive ? 'border-primary-accent' : 'border-gold-accent/50')}>
            {player.photoUrl ? (
                <img src={player.photoUrl} alt={player.name} className="w-full h-full rounded-md object-cover" />
            ) : (
                <span className="text-xl font-bold text-text-primary">{initials}</span>
            )}
            <PlayerTimer isActive={isActive && !player.isFolded} />
        </div>
    );
};

const PlayerTimer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  return (
    <div className="absolute -inset-1 w-[calc(100%+4px)] h-[calc(100%+4px)] rounded-lg border-2 border-primary-accent animate-pulse" />
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
        'scale-105 z-10': isActive && isMainPlayer,
        'transition-all duration-300': true,
    });

    return (
        <div className={`relative flex flex-col items-center w-24 ${isMainPlayer ? 'scale-110' : ''} ${playerStateClasses}`}>

            {isWinner && <div className="absolute -inset-2 animate-firework rounded-full pointer-events-none" />}
            
            {isMainPlayer && bestHandName && stage !== GameStage.SHOWDOWN && (
                <div className="absolute bottom-full mb-2 bg-black/70 backdrop-blur-sm text-gold-accent px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-fade-in whitespace-nowrap">
                    {bestHandName}
                </div>
            )}
            
            <div className={cn(
                "w-full bg-surface/70 backdrop-blur-sm border rounded-lg p-1 text-center shadow-lg",
                isWinner ? 'border-gold-accent shadow-glow-gold' : 'border-transparent',
                isActive ? 'border-primary-accent' : ''
            )}>
                 <PlayerAvatar player={player} isActive={isActive} />
                <p className="text-xs font-bold truncate mt-1">{player.name}</p>
                <p className={`text-sm font-mono ${player.stack > 0 ? 'text-white' : 'text-danger'}`}>{formatDisplayAmount(player.stack)}</p>
            </div>


            {showHand && !isFolded && (
                <div className={`flex items-center justify-center -mt-4 z-10`}>
                    <div className="-mr-4 transform -rotate-12">
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
                <div className="absolute top-0 right-0 -mt-2 -mr-2 text-white transform-gpu animate-pulse">
                     <UrlIcon src={assets.iconDealerChip} className="w-6 h-6"/>
                </div>
            )}

            {player.bet > 0 && !isFolded && (
                 <div className="absolute -bottom-4 flex flex-col items-center">
                    <div className="relative w-7 h-7">
                        <UrlIcon src={assets.iconPokerChip} className="w-full h-full text-gold-accent"/>
                    </div>
                    <div className="bg-black/70 border border-gold-accent text-gold-accent px-2 py-0.5 rounded-full text-xs font-mono shadow-md -mt-2">
                        {formatDisplayAmount(player.bet)}
                    </div>
                </div>
            )}
            
            {amountWon && amountWon > 0 && (
                <div className="absolute top-1/2 -translate-y-1/2 text-success font-bold text-sm animate-prize-up whitespace-nowrap">
                    + {formatDisplayAmount(amountWon)}
                </div>
            )}
             {isFolded && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-1 text-xs font-bold rounded-md uppercase">
                    Fold
                </div>
             )}
        </div>
    );
};

export default Player;