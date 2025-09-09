import React from 'react';
import { Card as CardType, GamePhase } from '../types';
import Card from './Card';

interface CommunityCardsProps {
  cards: CardType[];
  phase: GamePhase;
  highlightedCards?: CardType[];
}

const cardIsHighlighted = (card: CardType, highlightedCards: CardType[] = []) => {
    return highlightedCards.some(hc => hc.rank === card.rank && hc.suit === card.suit);
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, phase, highlightedCards }) => {
  const cardCount = phase === GamePhase.FLOP ? 3 : phase === GamePhase.TURN ? 4 : phase === GamePhase.RIVER || phase === GamePhase.SHOWDOWN ? 5 : 0;

  const renderedCards = cards.slice(0, cardCount);
  
  const communityPartOfHand = renderedCards.filter(rc => cardIsHighlighted(rc, highlightedCards));

  return (
    <div className="flex space-x-2">
      {renderedCards.length > 0 ? (
        renderedCards.map((card, index) => (
          <div key={`${card.rank}-${card.suit}-${index}`} className="transform scale-90">
             <Card 
                card={card} 
                revealed={true} 
                isHighlighted={cardIsHighlighted(card, communityPartOfHand)}
             />
          </div>
        ))
      ) : (
        <div className="h-24" /> // Placeholder for height
      )}
    </div>
  );
};

export default CommunityCards;
