
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

const Player: React.FC<PlayerProps> = ({ player, isMainPlayer, isDealer, godMode, cardBackUrl, formatDisplayAmount, isWinner, winningHand = [], stage, amountWon }) => {
    const isFolded = player.isFolded;
    const isActive = player.isActive;

    const isCardInWinningHand = (card: CardType) => {
        return winningHand.some(whCard => whCard.rank === card.rank && whCard.suit === card.suit);
    }
    const showCards = isMainPlayer || godMode || (!isFolded && stage === GameStage.SHOWDOWN);

  return (
    <div className={`relative flex flex-col items-center transition-all duration-300 ${isFolded ? 'opacity-50' : ''} ${isActive ? 'scale-110 shadow-glow-primary rounded-lg z-10' : ''}`}>
      {isWinner && (
          <div className="absolute -top-4 -left-4 -right-4 -bottom-4 animate-firework rounded-full pointer-events-none" />
      )}
      <div className="flex space-x-[-2.5rem] mb-1 min-h-[5rem] sm:min-h-[6rem]">
         {[0, 1].map(i => (
            player.hand?.[i] ? (
                 <Card key={i} card={player.hand[i]} revealed={showCards} overrideBackUrl={cardBackUrl} isHighlighted={isWinner && isCardInWinningHand(player.hand[i])} />
            ) : (
                <div key={i} className="w-14 h-20 sm:w-16 sm:h-24" />
            )
         ))}
      </div>

      <div className={`relative bg-black/70 backdrop-blur-sm border border-brand-border rounded-lg px-3 py-1 text-center min-w-[120px] max-w-[120px] transition-all ${isWinner ? 'border-gold-accent shadow-glow-gold' : ''}`}>
        <p className="text-sm font-bold truncate">{player.name}</p>
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

      {isDealer && (
        <div className="absolute top-0 -right-2 text-white transform-gpu animate-pulse">
            <DealerChipIcon className="w-6 h-6 bg-white text-black rounded-full p-0.5 shadow-lg" />
        </div>
      )}
      
      {isWinner && (
        <div className="absolute -top-3 bg-gold-accent text-black px-2 py-0.5 rounded-md text-xs font-bold shadow-lg uppercase tracking-wider">
            WINNER
        </div>
      )}
    </div>
  );
};

export default Player;