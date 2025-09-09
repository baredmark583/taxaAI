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
      
      {/* Avatar (positioned over the info box) */}
      <div className="absolute top-12 sm:top-16 z-20">
         <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-800 border-2 transition-all duration-300 ${isActive ? 'border-cyan-400 scale-105 shadow-lg shadow-cyan-500/30' : 'border-gray-600/50'} flex items-center justify-center text-white font-bold overflow-hidden`}>
            {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-lg sm:text-xl">{initials}</span>
            )}
        </div>
      </div>
      
      {/* Info Block */}
      <div className="relative bg-black/70 backdrop-blur-sm rounded-lg text-center w-full overflow-hidden border border-gray-700/50 pt-8 pb-1">
          <p className="text-white font-bold text-sm truncate px-1">{name}</p>
          <p className={`font-mono text-base ${stack === 0 ? 'text-red-500' : 'text-white'}`}>{formatDisplayAmount(stack)}</p>
          <p className="text-yellow-400 font-semibold text-xs h-4 capitalize flex items-center justify-center">
            {showHandStrength ? handResult.name : <span>&nbsp;</span>}
          </p>
          {isActive && !isFolded && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800/50">
                <div className="h-full bg-red-500 animate-timer-bar"></div>
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

       {/* Action display */}
       {lastActionDisplay && !isActive && (
         <div className="absolute top-1/2 -right-4 bg-gray-900/80 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg border border-gray-600">
           {lastActionDisplay}
         </div>
       )}

      {/* Bet amount */}
      {bet > 0 && (
         <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 p-1 pr-2.5 rounded-full border border-yellow-700 shadow-md">
            <PokerChipIcon className="w-5 h-5 text-red-500" />
            <span className="text-white text-xs font-bold font-mono">{formatDisplayAmount(bet)}</span>
        </div>
      )}

      {/* Dealer Chip */}
      {isDealer && (
        <div className="absolute top-[60%] -left-3 transform -translate-y-1/2">
            <DealerChipIcon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default Player;
