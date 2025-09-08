import React, { createContext, useState, ReactNode } from 'react';
import { Suit, Rank, SlotSymbol } from '../types';

// Helper function to generate default card faces from a pattern
const generateDefaultCardFaces = () => {
  const faces: { [suit in Suit]?: { [rank in Rank]?: string } } = {};
  // Using a cleaner, more modern set of SVG cards
  const pattern = 'https://raw.githubusercontent.com/htdebeer/SVG-cards/main/cards/{rank}{suit}.svg';
  
  const suitNameMap: Record<Suit, string> = {
    [Suit.HEARTS]: 'H',
    [Suit.DIAMONDS]: 'D',
    [Suit.CLUBS]: 'C',
    [Suit.SPADES]: 'S',
  };

  const rankNameMap: Record<Rank, string> = {
    [Rank.ACE]: 'A', [Rank.KING]: 'K', [Rank.QUEEN]: 'Q', [Rank.JACK]: 'J',
    [Rank.TEN]: 'T', [Rank.NINE]: '9', [Rank.EIGHT]: '8', [Rank.SEVEN]: '7',
    [Rank.SIX]: '6', [Rank.FIVE]: '5', [Rank.FOUR]: '4', [Rank.THREE]: '3', [Rank.TWO]: '2',
  };

  for (const suit of Object.values(Suit)) {
    faces[suit] = {};
    for (const rank of Object.values(Rank)) {
      faces[suit]![rank] = pattern
        .replace('{rank}', rankNameMap[rank])
        .replace('{suit}', suitNameMap[suit]);
    }
  }
  return faces as { [suit in Suit]: { [rank in Rank]: string } };
};

const defaultSlotSymbols: SlotSymbol[] = [
    { id: 1, name: 'SEVEN', imageUrl: 'https://www.svgrepo.com/show/19161/seven.svg', payout: 100, weight: 1 },
    { id: 2, name: 'BAR', imageUrl: 'https://www.svgrepo.com/show/210397/maps-and-flags-casino.svg', payout: 50, weight: 2 },
    { id: 3, name: 'BELL', imageUrl: 'https://www.svgrepo.com/show/19163/bell.svg', payout: 20, weight: 3 },
    { id: 4, name: 'CHERRY', imageUrl: 'https://www.svgrepo.com/show/198816/slot-machine-casino.svg', payout: 10, weight: 4 },
];

// Define the shape of your assets
interface GameAssets {
  cardBackUrl: string;
  tableBackgroundUrl: string;
  godModePassword: string;
  cardFaces: { [suit in Suit]: { [rank in Rank]: string } };
  slotSymbols: SlotSymbol[];
}

// Define the context type
interface AssetContextType {
  assets: GameAssets;
  setAssets: React.Dispatch<React.SetStateAction<GameAssets>>;
}

// Default asset values
const defaultAssets: GameAssets = {
  cardBackUrl: 'https://raw.githubusercontent.com/htdebeer/SVG-cards/main/cards/Red_back.svg',
  tableBackgroundUrl: 'https://img.freepik.com/premium-photo/poker-table-background_87394-8438.jpg',
  godModePassword: 'reveal_cards_42',
  cardFaces: generateDefaultCardFaces(),
  slotSymbols: defaultSlotSymbols,
};

// Create the context
export const AssetContext = createContext<AssetContextType>({
  assets: defaultAssets,
  setAssets: () => {},
});

// Create a provider component
interface AssetProviderProps {
  children: ReactNode;
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<GameAssets>(defaultAssets);

  return (
    <AssetContext.Provider value={{ assets, setAssets }}>
      {children}
    </AssetContext.Provider>
  );
};