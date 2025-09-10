import React from 'react';

interface HandStrengthIndicatorProps {
  handName: string | null;
}

const HandStrengthIndicator: React.FC<HandStrengthIndicatorProps> = ({ handName }) => {
  if (!handName) {
    return null;
  }

  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-gold-accent px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg animate-fade-in whitespace-nowrap">
      {handName}
    </div>
  );
};

export default HandStrengthIndicator;
