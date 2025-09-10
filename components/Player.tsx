

import React from 'react';
import { Player as PlayerType, Card as CardType, GameStage } from '../types';
import Card from './Card';
import { DealerChipIcon } from './Icons';

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
}

const PlayerAvatar: React.FC<{ player: PlayerType }> = ({ player }) => {
    const initials = player.name.substring(0, 2).toUpperCase();
    
    if (player.photoUrl) {
        return <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full border-2 border-gold-accent object-cover bg-background-light" />;
    }
    
    return (
        <div className="w-12 h-12 rounded-full border-2 border-gold-accent bg-background-light flex items-center justify-center">
            <span className="text-lg font-bold text-text-primary">{initials}</span>
        </div>
    );
};


const Player: React.FC<PlayerProps> = ({ player, isMainPlayer, isDealer, godMode, cardBackUrl, formatDisplayAmount, isWinner, winningHand = [], stage, amountWon }) => {
    const isFolded = player.isFolded;
    const isActive = player.isActive;

    const showCards = isMainPlayer || godMode || (!isFolded && stage === GameStage.SHOWDOWN);
    const showHand = player.hand && player.hand.length > 0;

    const isCardInWinningHand = (card: CardType) => {
        return winningHand.some(whCard => whCard.rank === card.rank && whCard.suit === card.suit);
    }

  return (
    <div className={`relative flex flex-col items-center transition-all duration-300 w-32 ${isFolded ? 'opacity-50' : ''} ${isActive ? 'scale-110 shadow-glow-primary rounded-lg z-10' : ''}`}>
      {isWinner && (
          <div className="absolute -top-4 -left-4 -right-4 -bottom-4 animate-firework rounded-full pointer-events-none" />
      )}
      <div className="relative">
         <PlayerAvatar player={player} />
         {isDealer && (
            <div className="absolute -top-1 -right-2 text-white transform-gpu animate-pulse">
                <DealerChipIcon className="w-6 h-6 bg-white text-black rounded-full p-0.5 shadow-lg" />
            </div>
         )}
      </div>

      <div className="flex justify-center items-center -mt-5 z-10 min-h-[4rem]">
        {showHand && !isFolded && (
            <div className={`flex ${isMainPlayer ? 'space-x-[-2.5rem]' : 'space-x-[-1rem]'}`}>
            {[0, 1].map(i => (
                player.hand?.[i] ? (
                    <Card 
                        key={i} 
                        card={player.hand[i]} 
                        revealed={showCards} 
                        overrideBackUrl={cardBackUrl}
                        isHighlighted={isWinner && showCards && isCardInWinningHand(player.hand[i])}
                        size={isMainPlayer ? 'normal' : 'small'}
                    />
                ) : null
            ))}
            </div>
        )}
      </div>
      
      <div className={`relative bg-black/70 backdrop-blur-sm border border-brand-border rounded-lg px-3 py-1 text-center min-w-[120px] max-w-[120px] transition-all -mt-8 ${isWinner ? 'border-gold-accent shadow-glow-gold' : ''}`}>
        <p className="text-sm font-bold truncate pt-4">{player.name}</p>
        <p className={`text-base font-mono ${player.stack > 0 ? 'text-white' : 'text-danger'}`}>{formatDisplayAmount(player.stack)}</p>
         {amountWon && amountWon > 0 && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-success font-bold text-sm animate-prize-up whitespace-nowrap">
                + {formatDisplayAmount(amountWon)}
            </div>
        )}
      </div>

      {player.bet > 0 && (
          <div className="absolute -bottom-6 bg-background-dark border border-gold-accent text-gold-accent px-2 py-0.5 rounded-full text-xs font-mono shadow-md">
              {formatDisplayAmount(player.bet)}
          </div>
      )}
      
      {isWinner && (
        <div className="absolute top-10 bg-gold-accent text-black px-2 py-0.5 rounded-md text-xs font-bold shadow-lg uppercase tracking-wider z-20">
            WINNER
        </div>
      )}
    </div>
  );
};

export default Player;