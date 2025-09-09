import React, { useState } from 'react';
import { Player, PlayerAction } from '../types';
import { FoldIcon, CallIcon, RaiseIcon } from './Icons';

interface ActionControlsProps {
  player: Player;
  isActive: boolean;
  onAction: (action: PlayerAction) => void;
  currentBet: number;
  smallBlind: number;
  bigBlind: number;
  formatDisplayAmount: (amount: number) => string;
}

const ActionControls: React.FC<ActionControlsProps> = ({ player, isActive, onAction, currentBet, smallBlind, bigBlind, formatDisplayAmount }) => {
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
    const minBet = Math.min(player.stack + player.bet, currentBet > 0 ? currentBet * 2 : bigBlind);
    const maxBet = player.stack + player.bet;
    const actualBetAmount = Math.max(minBet, Math.min(betAmount, maxBet));

    return (
        <div className="w-full max-w-lg mt-4 p-4 bg-black/40 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg flex flex-col items-center animate-fade-in">
            <input 
                type="range" 
                min={minBet}
                max={maxBet}
                step={smallBlind}
                value={actualBetAmount}
                onChange={handleBetChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
            />
            <div className="flex justify-between w-full text-xs text-gray-400 px-1 mt-1 font-mono">
                <span>{formatDisplayAmount(minBet)}</span>
                <span>{formatDisplayAmount(maxBet)}</span>
            </div>
            <div className="flex items-center space-x-4 mt-4">
                <button onClick={() => setIsBetting(false)} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold">Cancel</button>
                <button onClick={handleBetAction} className="px-10 py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold text-lg shadow-lg shadow-green-500/20">
                    Bet {formatDisplayAmount(actualBetAmount)}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-lg mt-4 p-2 flex flex-wrap justify-center items-center gap-2">
      <button
        onClick={() => onAction({ type: 'fold' })}
        className="flex items-center justify-center flex-grow basis-24 py-4 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg shadow-lg shadow-red-500/20 transition-transform transform hover:scale-105"
      >
        <FoldIcon className="w-5 h-5 mr-2" />
        <span>Fold</span>
      </button>

      {canCheck ? (
        <button
          onClick={() => onAction({ type: 'check' })}
          className="flex items-center justify-center flex-grow basis-24 py-4 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Check
        </button>
      ) : (
        <button
          onClick={() => onAction({ type: 'call' })}
          className="flex items-center justify-center flex-grow basis-24 py-4 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-transform transform hover:scale-105"
        >
          <CallIcon className="w-5 h-5 mr-2" />
          <span>Call {formatDisplayAmount(toCall)}</span>
        </button>
      )}

      <button
        onClick={() => setIsBetting(true)}
        className="flex items-center justify-center flex-grow basis-24 py-4 bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold rounded-lg shadow-lg shadow-green-500/20 transition-transform transform hover:scale-105"
      >
        <RaiseIcon className="w-5 h-5 mr-2" />
        <span>{currentBet > 0 ? 'Raise' : 'Bet'}</span>
      </button>
    </div>
  );
};

export default ActionControls;