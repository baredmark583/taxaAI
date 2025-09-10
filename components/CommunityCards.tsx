
import React from 'react';
import { Card as CardType, GameStage, Suit, Rank } from '../types';
import Card from './Card';

interface CommunityCardsProps {
  cards: CardType[];
  stage: GameStage;
  // FIX: Use the imported `CardType` for type annotation instead of the component name `Card`.
  winningHand?: CardType[];
}

const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, stage, winningHand = [] }) => {
  const isCardInWinningHand = (card: CardType) => {
    return winningHand.some(whCard => whCard.rank === card.rank && whCard.suit === card.suit);
  }

  const revealedCount =
    stage === GameStage.FLOP ? 3 :
    stage === GameStage.TURN ? 4 :
    stage === GameStage.RIVER || stage === GameStage.SHOWDOWN ? 5 : 0;
    
  const paddedCards = [...cards];
  while (paddedCards.length < 5) {
      paddedCards.push({ suit: Suit.SPADES, rank: Rank.ACE }); // Placeholder
  }

  return (
    <div className="flex justify-center items-center space-x-2 my-4 h-24">
      {paddedCards.map((card, index) => (
        <div key={index} className={`transition-all duration-500 ${index < revealedCount ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
           <Card 
             card={card} 
             revealed={index < revealedCount}
             isHighlighted={stage === GameStage.SHOWDOWN && isCardInWinningHand(card)}
           />
        </div>
      ))}
    </div>
  );
};

export default CommunityCards;