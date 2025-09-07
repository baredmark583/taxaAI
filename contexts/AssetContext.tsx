import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of your assets
interface GameAssets {
  cardBackUrl: string;
  cardFaceUrlPattern: string; // e.g., 'https://example.com/{rank}_of_{suit}.svg'
  tableBackgroundUrl: string;
}

// Define the context type
interface AssetContextType {
  assets: GameAssets;
  setAssets: React.Dispatch<React.SetStateAction<GameAssets>>;
}

// Default asset values
const defaultAssets: GameAssets = {
  cardBackUrl: 'https://www.svgrepo.com/show/472548/card-back.svg',
  cardFaceUrlPattern: 'https://cdn.jsdelivr.net/gh/hayeah/playing-cards-assets@master/svg-cards/{rank}_of_{suit}.svg',
  tableBackgroundUrl: 'https://wallpapercave.com/wp/wp1852445.jpg', // A generic poker table background
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
