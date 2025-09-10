import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
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
      const finalPosition = `translateY(-${(symbols.length - 3) * 104}px)`;
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
          <div key={i} className="flex-shrink-0 w-24 h-[104px] sm:w-32 sm:h-[104px] p-2 flex items-center justify-center">
            <img src={symbol.imageUrl} alt={symbol.name} className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]" />
          </div>
        ))}
      </div>
    </div>
  );
};


// Defines the 5 winning lines
const WIN_LINES = [
  { id: 0, coords: [[0,0], [1,0], [2,0]], path: { x1: "0%", y1: "16.66%", x2: "100%", y2: "16.66%" } }, // Top row
  { id: 1, coords: [[0,1], [1,1], [2,1]], path: { x1: "0%", y1: "50%", x2: "100%", y2: "50%" } },      // Middle row
  { id: 2, coords: [[0,2], [1,2], [2,2]], path: { x1: "0%", y1: "83.33%", x2: "100%", y2: "83.33%" } }, // Bottom row
  { id: 3, coords: [[0,0], [1,1], [2,2]], path: { x1: "0%", y1: "0%", x2: "100%", y2: "100%" } },      // Diagonal \
  { id: 4, coords: [[0,2], [1,1], [2,0]], path: { x1: "0%", y1: "100%", x2: "100%", y2: "0%" } },      // Diagonal /
];
const NUM_LINES = WIN_LINES.length;

const Slots: React.FC<SlotsProps> = ({ onExit, balance, setBalance }) => {
  const { assets } = useContext(AssetContext);
  const { slotSymbols } = assets;

  const betLevels = [10, 25, 50, 100, 250, 500];
  const [betIndex, setBetIndex] = useState(2);
  const betAmount = betLevels[betIndex];

  const [reels, setReels] = useState<SlotSymbol[][]>([[], [], []]);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

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

  const handleSpin = useCallback(() => {
    if (spinning || balance < betAmount) {
      if (balance < betAmount && !isAutoSpinning) {
        toast.error("Недостаточно средств");
      }
      return;
    }
     if (weightedSymbols.current.length === 0) {
      toast.error("Символы для слотов не загружены.");
      return;
    }

    setSpinning(true);
    setWinAmount(null);
    setWinningLines([]);
    setBalance(prev => prev - betAmount);

    const spinDuration = 3500;
    
    // Generate a 3x3 grid of results [reel][row]
    const results: SlotSymbol[][] = Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => 
            weightedSymbols.current[Math.floor(Math.random() * weightedSymbols.current.length)]
        )
    );
    
    const newReels: SlotSymbol[][] = Array(3).fill(null).map((_, reelIndex) => {
        const strip = [];
        const reelLength = 30;
        // Fill with random symbols, leaving space for the 3 results
        for (let j = 0; j < reelLength - 3; j++) {
            strip.push(slotSymbols[Math.floor(Math.random() * slotSymbols.length)]);
        }
        // Place the 3 results for this reel at the end of the strip
        strip.push(results[reelIndex][0]); // Top result
        strip.push(results[reelIndex][1]); // Middle result
        strip.push(results[reelIndex][2]); // Bottom result
        return strip;
    });

    setReels(newReels);

    setTimeout(() => {
      const finalReelSymbols = results;
      
      const betPerLine = betAmount / NUM_LINES;
      let totalPayout = 0;
      const linesThatWon: number[] = [];

      WIN_LINES.forEach(line => {
        const symbolsOnLine = line.coords.map(([reel, row]) => finalReelSymbols[reel][row]);
        const firstSymbol = symbolsOnLine[0];

        if (firstSymbol && symbolsOnLine.every(s => s?.name === firstSymbol.name)) {
          totalPayout += (firstSymbol.payout || 0) * betPerLine;
          linesThatWon.push(line.id);
        }
      });
      
      if (totalPayout > 0) {
        const roundedPayout = Math.round(totalPayout);
        setWinAmount(roundedPayout);
        setBalance(prev => prev + roundedPayout);
        setWinningLines(linesThatWon);
        toast.success(`Вы выиграли $${roundedPayout.toLocaleString()}!`);
      }
      
      setSpinning(false);
      
    }, spinDuration);
  }, [spinning, balance, betAmount, isAutoSpinning, slotSymbols, setBalance, setSpinning, setWinAmount, setWinningLines, setReels]);
  
  // Effect for handling the autospin loop
  useEffect(() => {
    let autoSpinTimeout: NodeJS.Timeout;

    if (isAutoSpinning && !spinning) {
      if (balance < betAmount) {
        setIsAutoSpinning(false);
        toast.info("Автоспин остановлен: недостаточно средств.");
        return;
      }
      // Add a small delay between spins for better UX
      autoSpinTimeout = setTimeout(() => {
        handleSpin();
      }, 1000); // 1 second delay
    }

    return () => {
      if (autoSpinTimeout) {
        clearTimeout(autoSpinTimeout);
      }
    };
  }, [isAutoSpinning, spinning, balance, betAmount, handleSpin]);
  
  const changeBet = (direction: 'up' | 'down') => {
      if (spinning || isAutoSpinning) return;
      if (direction === 'up') {
          setBetIndex(prev => Math.min(prev + 1, betLevels.length - 1));
      } else {
          setBetIndex(prev => Math.max(prev - 1, 0));
      }
  }

  const toggleAutoSpin = () => {
    setIsAutoSpinning(prev => !prev);
  };

  return (
    <div className="w-full h-full bg-cover bg-center text-white flex flex-col items-center justify-center p-4 font-sans"
      style={{ backgroundImage: `url(${assets.tableBackgroundUrl})`}}
    >
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center animate-fade-in">
        
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
                 {/* Winning line indicators */}
                <div className="absolute inset-x-4 inset-y-0 z-20 pointer-events-none">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        {winningLines.map(lineId => {
                            const line = WIN_LINES.find(l => l.id === lineId);
                            if (!line) return null;
                            return (
                                <line 
                                    key={lineId} 
                                    {...line.path} 
                                    stroke="var(--gold-accent)" 
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    className="animate-fade-in"
                                />
                            );
                        })}
                    </svg>
                </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
                 <div className="flex items-center gap-4">
                     <button onClick={() => changeBet('down')} disabled={spinning || isAutoSpinning || betIndex === 0} className="px-4 py-2 bg-surface hover:bg-background-light rounded-md font-bold text-lg disabled:opacity-50">-</button>
                     <div className="text-center">
                        <p className="text-sm text-text-secondary uppercase">Bet</p>
                        <p className="text-2xl font-mono">${betAmount.toLocaleString()}</p>
                    </div>
                     <button onClick={() => changeBet('up')} disabled={spinning || isAutoSpinning || betIndex === betLevels.length - 1} className="px-4 py-2 bg-surface hover:bg-background-light rounded-md font-bold text-lg disabled:opacity-50">+</button>
                </div>
                <div className="w-full max-w-xs flex items-center gap-4">
                     <button 
                        onClick={handleSpin} 
                        disabled={spinning || isAutoSpinning || balance < betAmount}
                        className="flex-1 py-4 px-8 bg-gradient-to-b from-success/80 to-success text-black font-bold text-2xl uppercase tracking-wider rounded-lg shadow-lg shadow-success/20 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:text-text-secondary disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                        {spinning ? '...' : 'Spin'}
                    </button>
                     <button
                        onClick={toggleAutoSpin}
                        disabled={spinning && !isAutoSpinning}
                        className={`py-4 px-6 rounded-lg font-bold text-xl uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:shadow-none ${
                            isAutoSpinning
                                ? 'bg-gradient-to-b from-danger/80 to-danger text-white shadow-danger/20'
                                : 'bg-gradient-to-b from-primary-accent/80 to-primary-accent text-black shadow-primary-accent/20'
                        }`}
                    >
                        {isAutoSpinning ? 'Stop' : 'Auto'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Slots;