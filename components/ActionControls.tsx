import React, { useState } from 'react';
import { Player, PlayerAction } from '../types';

interface ActionControlsProps {
  player: Player;
  isActive: boolean;
  onAction: (action: PlayerAction) => void;
  currentBet: number;
  smallBlind: number;
  currency: string;
  formatCurrency: (amount: number) => string;
}

const ActionControls: React.FC<ActionControlsProps> = ({ player, isActive, onAction, currentBet, smallBlind, currency, formatCurrency }) => {
  const [betAmount, setBetAmount] = useState(currentBet > 0 ? currentBet * 2 : smallBlind * 2);
  const [isBetting, setIsBetting] = useState(false);
  
  const canCheck = player.bet === currentBet;
  const toCall = currentBet - player.bet;

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(Number(e.target.value));
  };
  
  const handleBetAction = () => {
    if (betAmount > player.stack + player.bet) {
      onAction({ type: 'raise', amount: player.stack + player.bet });
    } else {
      onAction({ type: 'raise', amount: betAmount });
    }
    setIsBetting(false);
  };
  
  if (!isActive || player.isFolded || player.isAllIn) {
    return <div className="h-[120px] mt-4" />;
  }
  
  if (isBetting) {
    const minBet = Math.min(player.stack + player.bet, currentBet > 0 ? currentBet * 2 : smallBlind * 2);
    const maxBet = player.stack + player.bet;
    const actualBetAmount = Math.max(minBet, Math.min(betAmount, maxBet));

    return (
        <div className="w-full max-w-lg mt-4 p-2 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center animate-fade-in">
            <input 
                type="range" 
                min={minBet}
                max={maxBet}
                step={smallBlind}
                value={actualBetAmount}
                onChange={handleBetChange}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
            />
            <div className="flex justify-between w-full text-xs text-gray-400 px-1 mt-1">
                <span>{currency}{formatCurrency(minBet)}</span>
                <span>{currency}{formatCurrency(maxBet)}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
                <button onClick={() => setIsBetting(false)} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
                <button onClick={handleBetAction} className="px-8 py-2 bg-cyan-500 rounded text-white font-bold">
                    Bet {currency}{formatCurrency(actualBetAmount)}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-lg mt-4 p-2 flex justify-center items-center space-x-2">
      <button
        onClick={() => onAction({ type: 'fold' })}
        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
      >
        Fold
      </button>

      {canCheck ? (
        <button
          onClick={() => onAction({ type: 'check' })}
          className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Check
        </button>
      ) : (
        <button
          onClick={() => onAction({ type: 'call' })}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Call {currency}{formatCurrency(toCall)}
        </button>
      )}

      <button
        onClick={() => setIsBetting(true)}
        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
      >
        {currentBet > 0 ? 'Raise' : 'Bet'}
      </button>
    </div>
  );
};

export default ActionControls;