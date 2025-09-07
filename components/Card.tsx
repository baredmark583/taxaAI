import React, { useContext } from 'react';
import { Card as CardType, Suit, Rank } from '../types';
import { AssetContext } from '../contexts/AssetContext';

interface CardProps {
  card: CardType;
  revealed: boolean;
  isHighlighted?: boolean;
}

const suitNameMap: Record<Suit, string> = {
  [Suit.HEARTS]: 'hearts',
  [Suit.DIAMONDS]: 'diamonds',
  [Suit.CLUBS]: 'clubs',
  [Suit.SPADES]: 'spades',
};

const rankNameMap: Record<Rank, string> = {
  [Rank.ACE]: 'ace', [Rank.KING]: 'king', [Rank.QUEEN]: 'queen', [Rank.JACK]: 'jack',
  [Rank.TEN]: '10', [Rank.NINE]: '9', [Rank.EIGHT]: '8', [Rank.SEVEN]: '7',
  [Rank.SIX]: '6', [Rank.FIVE]: '5', [Rank.FOUR]: '4', [Rank.THREE]: '3', [Rank.TWO]: '2',
};


const Card: React.FC<CardProps> = ({ card, revealed, isHighlighted }) => {
  const { assets } = useContext(AssetContext);

  const getCardImageUrl = (card: CardType): string => {
    const suit = suitNameMap[card.suit];
    const rank = rankNameMap[card.rank];
    return assets.cardFaceUrlPattern
      .replace('{rank}', rank)
      .replace('{suit}', suit);
  };

  const imageUrl = revealed ? getCardImageUrl(card) : assets.cardBackUrl;

  return (
    <div className={`w-16 h-24 bg-white rounded-lg shadow-lg transition-all duration-300 ${isHighlighted ? 'ring-4 ring-yellow-400 shadow-xl shadow-yellow-500/40 transform scale-105' : ''}`}>
      <img 
        src={imageUrl} 
        alt={revealed ? `${card.rank} of ${card.suit}` : 'Card back'} 
        className="w-full h-full object-contain rounded-lg"
        onError={(e) => {
          // Fallback in case of a broken image link
          const target = e.target as HTMLImageElement;
          target.src = 'https://www.svgrepo.com/show/472548/card-back.svg';
        }}
      />
    </div>
  );
};

export default Card;