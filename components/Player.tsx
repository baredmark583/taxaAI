import React from 'react';
import { Player as PlayerType, Card as CardType, GamePhase } from '../types';
import Card from './Card';
import { DealerChipIcon } from './Icons';

interface PlayerProps {
  player: PlayerType;
  isUser: boolean;
  isActive: boolean;
  currency: string;
  formatCurrency: (amount: number) => string;
  godModeActive: boolean;
  gamePhase: GamePhase;
}

const cardIsPartOfHand = (card: CardType, handCards: CardType[] = []) => {
    return handCards.some(handCard => handCard.rank === card.rank && handCard.suit === card.suit);
}

const Player: React.FC<PlayerProps> = ({ player, isUser, isActive, currency, formatCurrency, godModeActive, gamePhase }) => {
  const { name, stack, cards, bet, isFolded, isDealer, isThinking, handResult } = player;
  
  const cardContainerClass = isUser ? 'space-x-[-40px]' : 'space-x-[-25px]';
  const cardScale = isUser ? 'scale-100' : 'scale-75';
  
  const isShowdown = gamePhase === GamePhase.SHOWDOWN;
  const showHand = isUser || godModeActive || (isShowdown && !isFolded);

  return (
    <div className={`relative flex flex-col items-center transition-all duration-300 ${isFolded ? 'opacity-40' : ''}`}>
      {/* Player cards */}
      <div className={`flex justify-center mb-1 h-24 ${cardContainerClass} ${cardScale}`}>
        {cards.length > 0 ? (
          <>
            <Card card={cards[0]} revealed={showHand} isHighlighted={isUser && cardIsPartOfHand(cards[0], handResult?.cards)} />
            <Card card={cards[1]} revealed={showHand} isHighlighted={isUser && cardIsPartOfHand(cards[1], handResult?.cards)} />
          </>
        ) : (
          <div className="w-20 h-24" /> // Placeholder for height
        )}
      </div>
      
      {/* Player info box */}
      <div className={`relative bg-gray-800/90 border-2 rounded-lg px-3 py-1 shadow-md text-center w-32 ${isActive ? 'border-cyan-400 scale-105' : 'border-gray-600'}`}>
        <p className="text-white font-bold text-sm truncate">{name}</p>
        <p className={`font-mono text-lg ${stack === 0 ? 'text-red-500' : 'text-green-400'}`}>{currency}{formatCurrency(stack)}</p>
         <p className="text-yellow-400 font-semibold text-xs h-4 capitalize">
            {(showHand && handResult && handResult.rank > -1) ? handResult.name : ''}
        </p>
        { isThinking && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div> }
      </div>

      {/* Bet amount */}
      {bet > 0 && (
        <div className="absolute -bottom-7 bg-black/70 rounded-full px-3 py-1 text-sm font-bold text-yellow-300 border border-yellow-500">
          {currency}{formatCurrency(bet)}
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