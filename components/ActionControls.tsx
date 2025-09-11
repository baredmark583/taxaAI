import React, { useState, useContext } from 'react';
import { Player, PlayerAction } from '../types';
import { cn } from '@/lib/utils';
import { AssetContext } from '../contexts/AssetContext';

const UrlIcon = ({ src, className }: { src: string; className?: string }) => {
  if (!src) return <div className={className} />;
  return (
    <div
      className={`icon-mask ${className}`}
      style={{ '--icon-url': `url(${src})` } as React.CSSProperties}
    />
  );
};

interface ActionControlsProps {
  player: Player;
  isActive: boolean;
  onAction: (action: PlayerAction) => void;
  currentBet: number;
  pot: number;
  smallBlind: number;
  bigBlind: number;
  formatDisplayAmount: (amount: number) => string;
}

const ActionButton = ({ children, onClick, className, disabled, iconSrc }: { children: React.ReactNode, onClick: () => void, className?: string, disabled?: boolean, iconSrc: string }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "flex items-center justify-center gap-2 flex-1 h-14 rounded-md shadow-lg transition-all transform hover:scale-105 disabled:bg-gray-700 disabled:text-text-secondary disabled:opacity-50 disabled:scale-100 disabled:shadow-none px-4",
            className
        )}
    >
        <UrlIcon src={iconSrc} className="w-6 h-6" />
        <span className="text-lg font-bold uppercase">{children}</span>
    </button>
);


const ActionControls: React.FC<ActionControlsProps> = ({ player, isActive, onAction, currentBet, pot, smallBlind, bigBlind, formatDisplayAmount }) => {
  const { assets } = useContext(AssetContext);
  const [isBetting, setIsBetting] = useState(false);
  
  const canCheck = player.bet === currentBet;
  const toCall = currentBet - player.bet;
  const minRaise = Math.min(player.stack + player.bet, currentBet > 0 ? currentBet * 2 : bigBlind);
  const [betAmount, setBetAmount] = useState(minRaise);


  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(Number(e.target.value));
  };
  
  const handleBetAction = () => {
    const maxBet = player.stack + player.bet;
    const finalAmount = Math.max(minRaise, Math.min(betAmount, maxBet));
    onAction({ type: 'raise', amount: finalAmount });
    setIsBetting(false);
  };
  
  if (!isActive || player.isFolded || player.isAllIn) {
    return null;
  }
  
  if (isBetting) {
    const minBet = minRaise;
    const maxBet = player.stack + player.bet;
    const actualBetAmount = Math.max(minBet, Math.min(betAmount, maxBet));

    return (
        <div className="w-full max-w-lg p-3 bg-background-light/80 backdrop-blur-md border border-brand-border rounded-lg shadow-2xl flex flex-col items-center animate-fade-in">
            <div className="flex justify-between w-full mb-3 text-xs">
                <button onClick={() => setBetAmount(Math.max(minBet, Math.min(Math.round(pot * 0.5), maxBet)))} className="bg-surface hover:bg-background-light px-3 py-1 rounded-md text-text-secondary hover:text-white transition-colors">1/2 Pot</button>
                <button onClick={() => setBetAmount(Math.max(minBet, Math.min(Math.round(pot * 0.75), maxBet)))} className="bg-surface hover:bg-background-light px-3 py-1 rounded-md text-text-secondary hover:text-white transition-colors">3/4 Pot</button>
                <button onClick={() => setBetAmount(Math.max(minBet, Math.min(pot, maxBet)))} className="bg-surface hover:bg-background-light px-3 py-1 rounded-md text-text-secondary hover:text-white transition-colors">Pot</button>
                <button onClick={() => setBetAmount(maxBet)} className="bg-surface hover:bg-background-light px-3 py-1 rounded-md text-text-secondary hover:text-white transition-colors">All-In</button>
            </div>
            <input 
                type="range" 
                min={minBet}
                max={maxBet}
                step={smallBlind}
                value={actualBetAmount}
                onChange={handleBetChange}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer range-sm accent-success"
            />
             <div className="flex justify-between w-full text-xs text-text-secondary px-1 mt-1 font-mono">
                <span>{formatDisplayAmount(minBet)}</span>
                <span>{formatDisplayAmount(maxBet)}</span>
            </div>
            <div className="flex items-center justify-between w-full space-x-4 mt-4">
                <button onClick={() => setIsBetting(false)} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold flex-1 transition-transform transform hover:scale-105">Отмена</button>
                <button onClick={handleBetAction} className="px-6 py-3 bg-success text-white rounded-lg font-bold text-lg shadow-lg shadow-success/20 hover:shadow-glow-success flex-1 transition-all transform hover:scale-105">
                    {currentBet > 0 ? 'Raise to' : 'Bet'} {formatDisplayAmount(actualBetAmount)}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-lg p-2 flex justify-center items-center gap-2 sm:gap-4">
      <ActionButton
        onClick={() => onAction({ type: 'fold' })}
        className="bg-danger text-white hover:shadow-glow-danger"
        iconSrc={assets.iconFold}
      >
        Fold
      </ActionButton>

      {canCheck ? (
        <ActionButton
          onClick={() => onAction({ type: 'check' })}
          className="bg-warning text-white"
          iconSrc={assets.iconCall}
        >
          Check
        </ActionButton>
      ) : (
        <ActionButton
          onClick={() => onAction({ type: 'call' })}
          className="bg-warning text-white"
          iconSrc={assets.iconCall}
        >
          Call {toCall > 0 ? formatDisplayAmount(toCall) : ''}
        </ActionButton>
      )}
      
      <ActionButton
        onClick={() => setIsBetting(true)}
        disabled={minRaise > player.stack + player.bet}
        className="bg-success text-white hover:shadow-glow-success"
        iconSrc={assets.iconRaise}
      >
        {currentBet > 0 ? 'Raise' : 'Bet'}
      </ActionButton>
    </div>
  );
};

export default ActionControls;