import React, { useState } from 'react';
import { Player, PlayerAction } from '../types';
import { RaiseIcon } from './Icons';

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

const ActionControls: React.FC<ActionControlsProps> = ({ player, isActive, onAction, currentBet, pot, smallBlind, bigBlind, formatDisplayAmount }) => {
  const [isBetting, setIsBetting] = useState(false);
  
  const canCheck = player.bet === currentBet;
  const toCall = currentBet - player.bet;
  const minRaise = Math.min(player.stack + player.bet, currentBet > 0 ? currentBet * 2 : bigBlind);
  const [betAmount, setBetAmount] = useState(minRaise);


  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(Number(e.target.value));
  };
  
  const handleBetAction = () => {
    if (betAmount >= player.stack + player.bet) {
      onAction({ type: 'raise', amount: player.stack + player.bet });
    } else {
      onAction({ type: 'raise', amount: betAmount });
    }
    setIsBetting(false);
  };
  
  if (!isActive || player.isFolded || player.isAllIn) {
    return <div className="h-[80px] mt-4" />;
  }
  
  if (isBetting) {
    const minBet = minRaise;
    const maxBet = player.stack + player.bet;
    const actualBetAmount = Math.max(minBet, Math.min(betAmount, maxBet));

    return (
        <div className="w-full max-w-lg mt-4 p-3 bg-black/60 backdrop-blur-md border border-brand-border rounded-lg shadow-lg flex flex-col items-center animate-fade-in">
            <div className="flex justify-between w-full mb-3 text-sm">
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
                <button onClick={() => setIsBetting(false)} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold flex-1 transition-transform transform hover:scale-105">Cancel</button>
                <button onClick={handleBetAction} className="px-6 py-3 bg-gradient-to-b from-success/90 to-success text-black rounded-lg text-white font-bold text-lg shadow-lg shadow-success/20 hover:shadow-glow-success flex-1 transition-all transform hover:scale-105">
                    Raise to {formatDisplayAmount(actualBetAmount)}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-lg mt-4 p-2 flex justify-center items-center gap-2">
      <button
        onClick={() => onAction({ type: 'fold' })}
        className="flex-1 py-4 bg-gradient-to-b from-danger/80 to-danger text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 uppercase hover:shadow-glow-danger"
      >
        Fold
      </button>

      {canCheck ? (
        <button
          onClick={() => onAction({ type: 'check' })}
          className="flex-1 py-4 bg-gradient-to-b from-warning/80 to-warning text-black font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 uppercase"
        >
          Check
        </button>
      ) : (
        <button
          onClick={() => onAction({ type: 'call' })}
          className="flex-1 py-4 bg-gradient-to-b from-warning/80 to-warning text-black font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 uppercase"
        >
          Call {toCall > 0 ? formatDisplayAmount(toCall) : ''}
        </button>
      )}
      
      <button
        onClick={() => { setBetAmount(minRaise); handleBetAction(); }}
        disabled={minRaise > player.stack + player.bet}
        className="flex-1 py-4 bg-gradient-to-b from-success/80 to-success text-black font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 uppercase disabled:from-gray-600 disabled:to-gray-700 disabled:text-text-secondary disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
      >
        {currentBet > 0 ? `Raise ${formatDisplayAmount(minRaise)}` : `Bet ${formatDisplayAmount(minRaise)}`}
      </button>

       <button
        onClick={() => { setBetAmount(minRaise); setIsBetting(true); }}
        className="p-4 bg-gradient-to-b from-green-900 to-green-800 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
      >
        <RaiseIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ActionControls;
