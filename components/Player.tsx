import React from 'react';
import { Player as PlayerType, Card as CardType, GamePhase } from '../types';
import Card from './Card';
import { DealerChipIcon, PokerChipIcon } from './Icons';

interface PlayerProps {
  player: PlayerType;
  isUser: boolean;
  isActive: boolean;
  formatDisplayAmount: (amount: number) => string;
  godModeActive: boolean;
  gamePhase: GamePhase;
  overrideCardBackUrl?: string;
}

const cardIsPartOfHand = (card: CardType, handCards: CardType[] = []) => {
    if (!handCards) return false;
    return handCards.some(handCard => handCard.rank === card.rank && handCard.suit === card.suit);
}

const Player: React.FC<PlayerProps> = ({ player, isUser, isActive, formatDisplayAmount, godModeActive, gamePhase, overrideCardBackUrl }) => {
  const { name, stack, cards, bet, isFolded, isDealer, handResult, avatarUrl, lastActionDisplay } = player;
  
  const cardContainerClass = isUser ? 'space-x-[-45px]' : 'space-x-[-30px]';
  const cardScale = isUser ? '' : 'scale-[0.8]';
  
  const isShowdown = gamePhase === GamePhase.SHOWDOWN;
  const showHand = isUser || godModeActive || (isShowdown && !isFolded);
  const showHandStrength = (isUser || (isShowdown && !isFolded)) && handResult && handResult.rank > -1;

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`relative flex flex-col items-center transition-all duration-300 w-32 ${isFolded ? 'opacity-40' : ''}`}>
      {/* Player cards */}
      <div className={`flex justify-center h-20 sm:h-24 transform ${cardContainerClass} ${cardScale}`}>
        {cards.length > 0 ? (
          <>
            <Card card={cards[0]} revealed={showHand} isHighlighted={isUser && cardIsPartOfHand(cards[0], handResult?.cards)} overrideBackUrl={overrideCardBackUrl} />
            <Card card={cards[1]} revealed={showHand} isHighlighted={isUser && cardIsPartOfHand(cards[1], handResult?.cards)} overrideBackUrl={overrideCardBackUrl} />
          </>
        ) : (
          <div className="w-20 h-24" /> // Placeholder for height
        )}
      </div>
      
      <div className="absolute top-12 sm:top-16 z-20">
         <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background-dark border-2 transition-all duration-300 ${isActive ? 'border-primary-accent scale-105 shadow-glow-primary' : 'border-brand-border/50'} flex items-center justify-center text-white font-bold overflow-hidden`}>
            {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-lg sm:text-xl">{initials}</span>
            )}
        </div>
      </div>
      
      <div className="relative bg-black/70 backdrop-blur-sm rounded-lg text-center w-full overflow-hidden border border-brand-border/50 pt-8 pb-1 shadow-lg">
          <p className="text-text-primary font-bold text-sm truncate px-1">{name}</p>
          <p className={`font-mono text-base ${stack === 0 ? 'text-danger' : 'text-text-primary'}`}>{formatDisplayAmount(stack)}</p>
          <p className="text-gold-accent font-semibold text-xs h-4 capitalize flex items-center justify-center">
            {showHandStrength ? handResult.name : <span>&nbsp;</span>}
          </p>
          {isActive && !isFolded && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-danger/30">
                <div className="h-full bg-danger animate-timer-bar shadow-glow-danger"></div>
                 <style>{`
                    @keyframes timer-bar {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                    .animate-timer-bar {
                        animation: timer-bar 15s linear forwards;
                    }
                `}</style>
            </div>
          )}
      </div>

       {lastActionDisplay && !isActive && (
         <div className="absolute top-1/2 -right-4 bg-surface/90 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg border border-brand-border/50">
           {lastActionDisplay}
         </div>
       )}

      {bet > 0 && (
         <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 py-1 pl-1 pr-2.5 rounded-full border border-gold-accent/50 shadow-lg">
            <PokerChipIcon className="w-6 h-6 text-red-500" />
            <span className="text-white text-xs font-bold font-mono">{formatDisplayAmount(bet)}</span>
        </div>
      )}

      {isDealer && (
        <div className="absolute top-[60%] -left-4 transform -translate-y-1/2 z-10 bg-blue-800 rounded-full p-0.5 shadow-md">
            <DealerChipIcon className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default Player;
