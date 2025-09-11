import React from 'react';
import { Card as CardType, GameStage, Suit, Rank } from '../types';
import Card from './Card';

interface CommunityCardsProps {
  cards: CardType[];
  stage: GameStage;
  winningHand?: CardType[];
}

const CardPlaceholder: React.FC = () => (
  <div className="w-10 h-[60px] sm:w-14 sm:h-[98px] md:w-16 md:h-24 bg-black/20 rounded-md sm:rounded-lg border-2 border-dashed border-surface" />
);


const CommunityCards: React.FC<CommunityCardsProps> = ({ cards, stage, winningHand = [] }) => {
  const isCardInWinningHand = (card: CardType) => {
    return winningHand.some(whCard => whCard.rank === card.rank && whCard.suit === card.suit);
  }

  const revealedCount =
    stage === GameStage.FLOP ? 3 :
    stage === GameStage.TURN ? 4 :
    stage === GameStage.RIVER || stage === GameStage.SHOWDOWN ? 5 : 0;
    
  const displayCards = Array(5).fill(null).map((_, i) => cards[i] || null);


  return (
    <div className="flex justify-center items-center space-x-1 sm:space-x-2 my-2 h-24">
      {displayCards.map((card, index) => (
        <div key={index} className={`transition-all duration-500 ${index < revealedCount ? 'opacity-100 scale-100' : 'opacity-100 scale-100'}`}>
            {index < revealedCount && card ? (
                 <Card 
                     card={card} 
                     revealed={true}
                     isHighlighted={stage === GameStage.SHOWDOWN && isCardInWinningHand(card)}
                 />
            ) : (
                <CardPlaceholder />
            )}
        </div>
      ))}
    </div>
  );
};

export default CommunityCards;