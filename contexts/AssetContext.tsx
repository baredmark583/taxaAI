import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Suit, Rank, SlotSymbol, GameAssets } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL;

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

  // FIX: Cast Object.values to the specific enum array type to prevent index signature errors.
  for (const suit of Object.values(Suit) as Suit[]) {
    faces[suit] = {};
    for (const rank of Object.values(Rank) as Rank[]) {
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

// Define the context type
interface AssetContextType {
  assets: GameAssets;
  setAssets: React.Dispatch<React.SetStateAction<GameAssets>>;
}

// Default asset values
const defaultAssets: GameAssets = {
  cardBackUrl: 'https://raw.githubusercontent.com/htdebeer/SVG-cards/main/cards/Red_back.svg',
  tableBackgroundUrl: 'https://i.imgur.com/Q9x2s70.png',
  godModePassword: 'reveal_cards_42',
  cardFaces: generateDefaultCardFaces(),
  slotSymbols: defaultSlotSymbols,
  // Default Icons - updated for a sleeker look
  iconFavicon: 'https://api.iconify.design/mdi/poker-chip.svg',
  iconManifest: 'https://api.iconify.design/mdi/poker-chip.svg',
  iconCrypto: 'https://api.iconify.design/ph/currency-ton-bold.svg',
  iconPlayMoney: 'https://api.iconify.design/solar/money-bag-bold-duotone.svg',
  iconExit: 'https://api.iconify.design/solar/logout-3-linear.svg',
  iconSettings: 'https://api.iconify.design/solar/settings-linear.svg',
  iconUsers: 'https://api.iconify.design/solar/users-group-rounded-linear.svg',
  iconDealerChip: 'https://api.iconify.design/mdi/alpha-d-circle.svg',
  iconPokerChip: 'https://api.iconify.design/mdi/poker-chip.svg',
  iconSlotMachine: 'https://api.iconify.design/solar/slot-machine-bold-duotone.svg',
  iconRoulette: 'https://api.iconify.design/mdi/roulette.svg',
  iconFold: 'https://api.iconify.design/mdi/hand-back-right-off-outline.svg',
  iconCall: 'https://api.iconify.design/mdi/check.svg',
  iconRaise: 'https://api.iconify.design/mdi/arrow-up-bold-box-outline.svg',
  iconBank: 'https://api.iconify.design/solar/wallet-money-bold-duotone.svg',
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

  useEffect(() => {
    const fetchAssets = async () => {
      if (!API_URL) {
        console.error("VITE_API_URL is not defined. Using default assets.");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/assets`);
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const data = await response.json();
        if (data.cardFaces && data.cardBackUrl && data.iconFavicon) {
            setAssets(data);
            const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
            if (favicon) {
                favicon.href = data.iconFavicon;
            }
        } else {
             console.error("Fetched asset data is incomplete. Using default assets.");
        }
      } catch (error) {
        console.error('Error fetching assets:', error, 'Using default assets.');
      }
    };

    fetchAssets();
  }, []);


  return (
    <AssetContext.Provider value={{ assets, setAssets }}>
      {children}
    </AssetContext.Provider>
  );
};
