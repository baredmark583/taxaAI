import React, { useContext } from 'react';
import { Card as CardType } from '../types';
import { AssetContext } from '../contexts/AssetContext';

interface CardProps {
  card: CardType;
  revealed: boolean;
  isHighlighted?: boolean;
  overrideBackUrl?: string;
  size?: 'normal' | 'small';
}

const Card: React.FC<CardProps> = ({ card, revealed, isHighlighted, overrideBackUrl, size = 'normal' }) => {
  const { assets } = useContext(AssetContext);

  const getCardImageUrl = (card: CardType): string => {
    try {
      // Look up the specific URL from the context's nested object
      const url = assets.cardFaces[card.suit]?.[card.rank];
      // Provide a fallback if a specific card URL isn't found
      return url || assets.cardBackUrl; 
    } catch (e) {
      console.error("Could not find card image for:", card);
      return assets.cardBackUrl;
    }
  };

  const imageUrl = revealed ? getCardImageUrl(card) : overrideBackUrl || assets.cardBackUrl;

  const sizeClasses = size === 'small'
    ? 'w-10 h-14'
    : 'w-14 h-20 sm:w-16 sm:h-24';

  return (
    <div className={`${sizeClasses} bg-white rounded-lg shadow-lg transition-all duration-300 ${isHighlighted ? 'ring-2 ring-gold-accent shadow-glow-gold transform scale-105' : ''}`}>
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