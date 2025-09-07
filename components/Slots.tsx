import React, { useState, useEffect, useContext } from 'react';
import { GameMode } from '../types';
import { ExitIcon } from './Icons';
import { AssetContext } from '../contexts/AssetContext';

interface SlotsProps {
  onExit: () => void;
  realMoneyBalance: number;
  playMoneyBalance: number;
  setRealMoneyBalance: React.Dispatch<React.SetStateAction<number>>;
  setPlayMoneyBalance: React.Dispatch<React.SetStateAction<number>>;
}

const Reel: React.FC<{ symbol: any, spinning: boolean, allReelSymbols: any[] }> = ({ symbol, spinning, allReelSymbols }) => {
    const [displaySymbol, setDisplaySymbol] = useState(symbol);

    useEffect(() => {
        if (spinning) {
            const interval = setInterval(() => {
                setDisplaySymbol(allReelSymbols[Math.floor(Math.random() * allReelSymbols.length)]);
            }, 50);
            return () => clearInterval(interval);
        } else {
            setDisplaySymbol(symbol);
        }
    }, [spinning, symbol, allReelSymbols]);

    return (
        <div className="w-24 h-32 md:w-32 md:h-40 bg-gray-700 rounded-lg flex items-center justify-center shadow-inner overflow-hidden p-4">
            <img src={displaySymbol.imageUrl} alt={displaySymbol.name} className="w-full h-full object-contain" />
        </div>
    );
};


const Slots: React.FC<SlotsProps> = ({ onExit, realMoneyBalance, playMoneyBalance, setRealMoneyBalance, setPlayMoneyBalance }) => {
    const { assets } = useContext(AssetContext);
    const { slotSymbols } = assets;

    const [mode, setMode] = useState<GameMode>(GameMode.PLAY_MONEY);
    
    const balance = mode === GameMode.PLAY_MONEY ? playMoneyBalance : realMoneyBalance;
    const setBalance = mode === GameMode.PLAY_MONEY ? setPlayMoneyBalance : setRealMoneyBalance;
    const currency = mode === GameMode.PLAY_MONEY ? '$' : 'ETH';
    const format = (amount: number) => mode === GameMode.REAL_MONEY ? amount.toFixed(4) : amount.toLocaleString();
    
    const betAmounts = mode === GameMode.PLAY_MONEY ? [10, 50, 100, 500] : [0.001, 0.005, 0.01, 0.02];
    
    const [reels, setReels] = useState(() => slotSymbols.length >= 3 ? [slotSymbols[0], slotSymbols[1], slotSymbols[2]] : [slotSymbols[0], slotSymbols[0], slotSymbols[0]]);
    const [spinning, setSpinning] = useState(false);
    const [betAmount, setBetAmount] = useState(betAmounts[0]);
    const [message, setMessage] = useState('');

    // Create a weighted array of symbols for spinning the reels
    const allReelSymbols = React.useMemo(() => {
        if (!slotSymbols || slotSymbols.length === 0) return [];
        return slotSymbols.flatMap(symbol => Array(symbol.weight || 1).fill(symbol));
    }, [slotSymbols]);
    

    useEffect(() => {
        setBetAmount(betAmounts[0]);
    }, [mode]);
    
    useEffect(() => {
        // Set initial reels if symbols load after component mount
        if (reels.every(r => r === undefined) && slotSymbols.length > 0) {
             setReels(slotSymbols.length >= 3 ? [slotSymbols[0], slotSymbols[1], slotSymbols[2]] : [slotSymbols[0], slotSymbols[0], slotSymbols[0]]);
        }
    }, [slotSymbols, reels]);

    const handleSpin = () => {
        if (spinning || balance < betAmount || allReelSymbols.length === 0) {
            if (balance < betAmount) setMessage("Not enough funds!");
            if (allReelSymbols.length === 0) setMessage("No symbols configured!");
            return;
        }
        
        setSpinning(true);
        setBalance(prev => prev - betAmount);
        setMessage('');

        setTimeout(() => {
            const newReels = [
                allReelSymbols[Math.floor(Math.random() * allReelSymbols.length)],
                allReelSymbols[Math.floor(Math.random() * allReelSymbols.length)],
                allReelSymbols[Math.floor(Math.random() * allReelSymbols.length)],
            ];
            setReels(newReels);

            let winAmount = 0;
            // Payouts are based on the symbol's name (or a unique ID)
            if (newReels[0].name === newReels[1].name && newReels[1].name === newReels[2].name) {
                winAmount = betAmount * newReels[0].payout;
            }
            
            if (winAmount > 0) {
                setBalance(b => b + winAmount);
                setMessage(`You won ${format(winAmount)} ${currency}!`);
            }
            
            setSpinning(false);
        }, 2000);
    };
    
    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center p-2 overflow-hidden font-sans">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-900/50 z-20">
                <button onClick={onExit} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <ExitIcon className="w-6 h-6" />
                    <span>Lobby</span>
                </button>
                <h1 className="text-xl font-bold text-purple-400">Crypto Slots</h1>
                <div className="w-24"></div>
            </div>

            <div className="flex flex-col items-center justify-center bg-gray-800 p-6 rounded-2xl shadow-lg border-2 border-purple-800 w-full max-w-md md:max-w-xl">
                <div className="flex space-x-2 md:space-x-4 mb-6 bg-gray-900 p-4 rounded-lg shadow-lg">
                    {reels.map((symbol, i) => <Reel key={i} symbol={symbol} spinning={spinning} allReelSymbols={allReelSymbols} /> )}
                </div>

                <div className="h-8 text-yellow-400 text-lg font-bold mb-4 animate-pulse">{message}</div>

                <div className="w-full bg-gray-900/50 p-4 rounded-lg flex flex-col items-center">
                    <div className="flex justify-between w-full mb-4">
                        <div className="text-left">
                            <p className="text-gray-400 text-sm">Balance</p>
                            <p className="text-white font-mono text-lg">{format(balance)} {currency}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-sm">Bet</p>
                            <p className="text-white font-mono text-lg">{format(betAmount)} {currency}</p>
                        </div>
                    </div>
                     <div className="flex space-x-2 mb-4">
                        {betAmounts.map(amount => (
                            <button key={amount} onClick={() => !spinning && setBetAmount(amount)} className={`px-4 py-1 rounded-full font-semibold text-sm transition-colors ${betAmount === amount ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                {format(amount)}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleSpin} disabled={spinning || balance < betAmount} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md text-xl transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:scale-100">
                        {spinning ? 'Spinning...' : 'SPIN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Slots;