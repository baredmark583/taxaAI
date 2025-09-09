import React from 'react';
import { Player as PlayerType, Card as CardType, GamePhase } from '../types';
import Card from './Card';
import { DealerChipIcon } from './Icons';

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
  const { name, stack, cards, bet, isFolded, isDealer, isThinking, handResult, avatarUrl } = player;
  
  const cardContainerClass = isUser ? 'space-x-[-40px]' : 'space-x-[-25px]';
  const cardScale = isUser ? 'scale-100' : 'scale-75';
  
  const isShowdown = gamePhase === GamePhase.SHOWDOWN;
  const showHand = isUser || godModeActive || (isShowdown && !isFolded);

  // Condition to show hand strength text for the user, or for anyone at showdown
  const showHandStrength = (isUser || (isShowdown && !isFolded)) && handResult && handResult.rank > -1;

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`relative flex flex-col items-center transition-all duration-300 ${isFolded ? 'opacity-40' : ''}`}>
      {/* Player cards */}
      <div className={`flex justify-center mb-1 h-20 sm:h-24 ${cardContainerClass} ${cardScale}`}>
        {cards.length > 0 ? (
          <>
            <Card card={cards[0]} revealed={showHand} isHighlighted={isUser && cardIsPartOfHand(cards[0], handResult?.cards)} overrideBackUrl={overrideCardBackUrl} />
            <Card card={cards[1]} revealed={showHand} isHighlighted={isUser && cardIsPartOfHand(cards[1], handResult?.cards)} overrideBackUrl={overrideCardBackUrl} />
          </>
        ) : (
          <div className="w-20 h-24" /> // Placeholder for height
        )}
      </div>
      
      {/* Avatar + Info Block */}
      <div className="relative flex flex-col items-center">
        {/* Avatar Container (acts as the circular seat) */}
        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-800 border-2 transition-all duration-300 ${isActive ? 'border-cyan-400 scale-105 shadow-lg shadow-cyan-500/30' : 'border-gray-600/50'} flex items-center justify-center text-white font-bold overflow-hidden`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl sm:text-2xl">{initials}</span>
          )}
          {isThinking && <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>}
        </div>

        {/* Info box (below avatar) */}
        <div className="relative bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 text-center w-28 sm:w-32 overflow-hidden mt-[-16px] z-10 border border-gray-700/50">
          <p className="text-white font-bold text-xs sm:text-sm truncate">{name}</p>
          <p className={`font-mono text-base sm:text-lg ${stack === 0 ? 'text-red-500' : 'text-green-400'}`}>{formatDisplayAmount(stack)}</p>
          <p className="text-yellow-400 font-semibold text-[10px] sm:text-xs h-4 capitalize flex items-center justify-center">
            {showHandStrength ? handResult.name : <span>&nbsp;</span>}
          </p>
          {isActive && !isFolded && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400/50">
                <div className="h-full bg-cyan-400 animate-timer-bar"></div>
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
      </div>

      {/* Bet amount */}
      {bet > 0 && (
        <div className="absolute top-[150px] bg-black/70 rounded-full px-3 py-1 text-sm font-bold text-yellow-300 border border-yellow-500">
          {formatDisplayAmount(bet)}
        </div>
      )}

      {/* Dealer Chip */}
      {isDealer && (
        <div className="absolute top-1/2 -right-5 transform -translate-y-1/2">
            <DealerChipIcon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default Player;