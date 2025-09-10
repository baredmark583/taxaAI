import React, { useState, useEffect, useContext, useRef } from 'react';
import { ExitIcon } from './Icons';
import { AssetContext } from '../contexts/AssetContext';
import { SlotSymbol } from '../types';
import { toast } from 'sonner';

interface SlotsProps {
  onExit: () => void;
  balance: number;
  setBalance: (updater: (prevBalance: number) => number) => void;
}

// Reel sub-component
const Reel: React.FC<{ symbols: SlotSymbol[]; spinning: boolean; reelId: number }> = ({ symbols, spinning, reelId }) => {
  const reelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reelRef.current) {
      // Set the final position without animation on initial render or when not spinning
      const finalPosition = `translateY(-${(symbols.length - 3) * 104}px)`; // 104px = h-24 (96px) + gap
      if (!spinning) {
        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = finalPosition;
        return;
      }
      
      // Start animation from the top
      reelRef.current.style.transition = 'none';
      reelRef.current.style.transform = 'translateY(0)';
      
      // Force reflow to apply the start position before transitioning
      reelRef.current.offsetHeight; 
      
      // Apply animation to the final position
      reelRef.current.style.transition = `transform ${2.5 + reelId * 0.5}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
      reelRef.current.style.transform = finalPosition;
    }
  }, [spinning, symbols, reelId]);

  // Render a very long list of symbols for a continuous spinning illusion
  const repeatedSymbols = Array(5).fill(symbols).flat();

  return (
    <div className="w-24 h-[312px] sm:w-32 sm:h-[312px] overflow-hidden bg-black/50 rounded-lg shadow-inner">
      <div ref={reelRef} className="flex flex-col">
        {repeatedSymbols.map((symbol, i) => (
          <div key={i} className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-24 p-2 flex items-center justify-center">
            <img src={symbol.imageUrl} alt={symbol.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
          </div>
        ))}
      </div>
    </div>
  );
};


const Slots: React.FC<SlotsProps> = ({ onExit, balance, setBalance }) => {
  const { assets } = useContext(AssetContext);
  const { slotSymbols } = assets;

  const betLevels = [10, 25, 50, 100, 250, 500];
  const [betIndex, setBetIndex] = useState(2);
  const betAmount = betLevels[betIndex];

  const [reels, setReels] = useState<SlotSymbol[][]>([[], [], []]);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);

  const weightedSymbols = useRef<SlotSymbol[]>([]);
  
  useEffect(() => {
    if (slotSymbols.length === 0) return;

    const pool: SlotSymbol[] = [];
    slotSymbols.forEach(symbol => {
      for (let i = 0; i < (symbol.weight || 1); i++) {
        pool.push(symbol);
      }
    });
    weightedSymbols.current = pool;
    
    // Set initial reels display to something valid
     setReels([
      [slotSymbols[1 % slotSymbols.length], slotSymbols[2 % slotSymbols.length], slotSymbols[3 % slotSymbols.length]],
      [slotSymbols[0 % slotSymbols.length], slotSymbols[1 % slotSymbols.length], slotSymbols[2 % slotSymbols.length]],
      [slotSymbols[3 % slotSymbols.length], slotSymbols[0 % slotSymbols.length], slotSymbols[1 % slotSymbols.length]],
    ]);
  }, [slotSymbols]);

  const handleSpin = () => {
    if (spinning || balance < betAmount) {
      if (balance < betAmount) toast.error("Недостаточно средств");
      return;
    }
     if (weightedSymbols.current.length === 0) {
      toast.error("Символы для слотов не загружены.");
      return;
    }

    setSpinning(true);
    setWinAmount(null);
    setBalance(prev => prev - betAmount);

    const spinDuration = 3500;

    const results: SlotSymbol[] = Array(3).fill(null).map(() => 
        weightedSymbols.current[Math.floor(Math.random() * weightedSymbols.current.length)]
    );
    
    const newReels: SlotSymbol[][] = Array(3).fill(null).map((_, reelIndex) => {
        const strip = [];
        const reelLength = 30;
        for (let j = 0; j < reelLength; j++) {
            strip.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
        }
        // Place the result at the end of the strip
        strip[reelLength - 2] = results[reelIndex];
        return strip;
    });

    setReels(newReels);

    setTimeout(() => {
      const finalSymbols = results;
      
      let payout = 0;
      // Check for three of a kind on the middle line
      if (finalSymbols[0]?.name === finalSymbols[1]?.name && finalSymbols[1]?.name === finalSymbols[2]?.name) {
          payout = (finalSymbols[0].payout || 0) * betAmount;
      }
      
      if (payout > 0) {
        setWinAmount(payout);
        setBalance(prev => prev + payout);
      }
      
      setSpinning(false);
      
    }, spinDuration);
  };
  
  const changeBet = (direction: 'up' | 'down') => {
      if (spinning) return;
      if (direction === 'up') {
          setBetIndex(prev => Math.min(prev + 1, betLevels.length - 1));
      } else {
          setBetIndex(prev => Math.max(prev - 1, 0));
      }
  }

  return (
    <div className="w-screen h-screen bg-cover bg-center text-white flex flex-col items-center justify-center p-4 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background-light to-background-dark"
      style={{ backgroundImage: `url(${assets.tableBackgroundUrl})`}}
    >
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="absolute top-0 left-0">
            <button 
                onClick={onExit}
                className="flex items-center space-x-2 px-3 py-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors text-sm"
            >
                <ExitIcon />
                <span>Lobby</span>
            </button>
        </div>
        
        <div className="mb-4">
          <h1 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-gold-accent drop-shadow-[0_0_15px_rgba(255,217,0,0.4)]">
            CRYPTO SLOTS
          </h1>
        </div>

        <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 p-4 sm:p-6 rounded-2xl shadow-2xl border-4 border-gold-accent/50">
             <div className="grid grid-cols-2 gap-4 mb-4 text-white">
                <div className="bg-black/50 p-2 rounded-lg border border-brand-border">
                    <p className="text-xs text-text-secondary uppercase">Balance</p>
                    <p className="text-xl sm:text-2xl font-mono font-bold">${balance.toLocaleString()}</p>
                </div>
                 <div className="bg-black/50 p-2 rounded-lg border border-brand-border">
                    <p className="text-xs text-text-secondary uppercase">Win</p>
                     <p className={`text-xl sm:text-2xl font-mono font-bold transition-colors ${winAmount && winAmount > 0 ? 'text-success animate-pulse' : 'text-white'}`}>
                        {winAmount !== null ? `$${winAmount.toLocaleString()}`: '$0'}
                    </p>
                </div>
            </div>

            <div className="relative flex justify-center items-center space-x-2 sm:space-x-4 p-4 bg-black/30 rounded-lg shadow-inner">
                <div className="absolute inset-y-0 left-0 w-full h-1/3 top-1/3 bg-primary-accent/10 border-y-2 border-primary-accent pointer-events-none z-10" />
                <Reel symbols={reels[0]} spinning={spinning} reelId={0} />
                <Reel symbols={reels[1]} spinning={spinning} reelId={1} />
                <Reel symbols={reels[2]} spinning={spinning} reelId={2} />
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
                 <div className="flex items-center gap-4">
                     <button onClick={() => changeBet('down')} disabled={spinning || betIndex === 0} className="px-4 py-2 bg-surface hover:bg-background-light rounded-md font-bold text-lg disabled:opacity-50">-</button>
                     <div className="text-center">
                        <p className="text-sm text-text-secondary uppercase">Bet</p>
                        <p className="text-2xl font-mono">${betAmount.toLocaleString()}</p>
                    </div>
                     <button onClick={() => changeBet('up')} disabled={spinning || betIndex === betLevels.length - 1} className="px-4 py-2 bg-surface hover:bg-background-light rounded-md font-bold text-lg disabled:opacity-50">+</button>
                </div>
                 <button 
                    onClick={handleSpin} 
                    disabled={spinning || balance < betAmount}
                    className="w-full max-w-xs py-4 px-8 bg-gradient-to-b from-success/80 to-success text-black font-bold text-2xl uppercase tracking-wider rounded-lg shadow-lg shadow-success/20 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:text-text-secondary disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                >
                    {spinning ? 'Spinning...' : 'Spin'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Slots;