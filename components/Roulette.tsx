import React, { useState, useEffect } from 'react';
import { GameMode } from '../types';
import { ExitIcon } from './Icons';

interface RouletteProps {
  onExit: () => void;
  realMoneyBalance: number;
  playMoneyBalance: number;
  setRealMoneyBalance: React.Dispatch<React.SetStateAction<number>>;
  setPlayMoneyBalance: React.Dispatch<React.SetStateAction<number>>;
}

const numberColors: { [key: number]: 'red' | 'black' | 'green' } = {
  0: 'green', 1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red', 19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red', 31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red',
};
const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const Roulette: React.FC<RouletteProps> = ({ onExit, realMoneyBalance, playMoneyBalance, setRealMoneyBalance, setPlayMoneyBalance }) => {
    const [mode, setMode] = useState<GameMode>(GameMode.PLAY_MONEY);
    
    const balance = mode === GameMode.PLAY_MONEY ? playMoneyBalance : realMoneyBalance;
    const setBalance = mode === GameMode.PLAY_MONEY ? setPlayMoneyBalance : setRealMoneyBalance;
    const currency = mode === GameMode.PLAY_MONEY ? '$' : 'TON';
    const format = (amount: number) => mode === GameMode.REAL_MONEY ? amount.toFixed(4) : amount.toLocaleString();
    
    const chipValues = mode === GameMode.PLAY_MONEY ? [10, 50, 100, 500] : [0.001, 0.005, 0.01, 0.02];
    const [selectedChip, setSelectedChip] = useState(chipValues[0]);

    const [bets, setBets] = useState<{ [key: string]: number }>({});
    const [spinning, setSpinning] = useState(false);
    const [winningNumber, setWinningNumber] = useState<number | null>(null);
    const [message, setMessage] = useState('Place your bets!');
    const [rotation, setRotation] = useState(0);

    const placeBet = (betOn: string) => {
        if (spinning || balance < selectedChip) return;
        setBalance(prev => prev - selectedChip);
        setBets(prev => ({ ...prev, [betOn]: (prev[betOn] || 0) + selectedChip }));
    };

    const handleSpin = () => {
        if (Object.keys(bets).length === 0) return;
        setSpinning(true);
        setWinningNumber(null);
        setMessage('');
        
        const winner = Math.floor(Math.random() * 37);
        const winnerIndex = wheelNumbers.indexOf(winner);
        const randomSpins = 5 + Math.floor(Math.random() * 5);
        const newRotation = rotation + (360 * randomSpins) - (winnerIndex * (360 / 37));
        setRotation(newRotation);

        setTimeout(() => {
            setWinningNumber(winner);
            let payout = 0;
            let totalBetAmount = Object.values(bets).reduce((a,b)=>a+b,0);

            for (const betOn in bets) {
                const betAmount = bets[betOn];
                if (betOn === 'red' && numberColors[winner] === 'red') payout += betAmount * 2;
                else if (betOn === 'black' && numberColors[winner] === 'black') payout += betAmount * 2;
                else if (betOn === 'even' && winner !== 0 && winner % 2 === 0) payout += betAmount * 2;
                else if (betOn === 'odd' && winner % 2 !== 0) payout += betAmount * 2;
            }

            if (payout > 0) {
                setBalance(b => b + payout);
                setMessage(`Winner: ${winner}! You won ${format(payout - totalBetAmount)} ${currency}!`);
            } else {
                setMessage(`Winner: ${winner}. Better luck next time!`);
            }
            
            setBets({});
            setSpinning(false);
        }, 5000); // 5 second spin animation
    };

    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

    return (
        <div className="w-screen h-screen bg-background-dark flex flex-col items-center justify-center p-2 font-sans overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-danger/20 via-background-light to-background-dark">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-black/30 z-20">
                <button onClick={onExit} className="flex items-center space-x-2 text-text-secondary hover:text-white transition-colors">
                    <ExitIcon className="w-6 h-6" /> <span>Lobby</span>
                </button>
                 <div className="text-center">
                    <p className="text-text-secondary text-sm">Balance</p>
                    <p className="text-white font-mono text-lg">{format(balance)} {currency}</p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
                 <div className="relative w-72 h-72 md:w-96 md:h-96">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-gold-accent z-20 drop-shadow-[0_0_5px_rgba(255,215,0,0.7)]"></div>
                    <div
                        className="w-full h-full rounded-full bg-cover bg-center shadow-2xl transition-transform duration-[5000ms] ease-out"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            backgroundImage: `url('https://www.vhv.rs/dpng/d/536-5363361_european-roulette-wheel-hd-png-download.png')`,
                        }}
                    >
                    </div>
                </div>

                <div className="h-8 text-gold-accent text-xl font-bold animate-pulse">{message}</div>

                <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl shadow-lg w-full max-w-lg border border-brand-border">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button onClick={() => placeBet('red')} className="bg-red-700/80 hover:bg-red-600 p-4 rounded-md text-white font-bold text-lg relative transition-all transform hover:scale-105">RED <span className="absolute top-1 right-2 text-xs opacity-80">{bets.red ? format(bets.red) : ''}</span></button>
                        <button onClick={() => placeBet('black')} className="bg-gray-900/80 hover:bg-gray-800 p-4 rounded-md text-white font-bold text-lg relative transition-all transform hover:scale-105">BLACK <span className="absolute top-1 right-2 text-xs opacity-80">{bets.black ? format(bets.black) : ''}</span></button>
                        <button onClick={() => placeBet('even')} className="bg-blue-700/80 hover:bg-blue-600 p-4 rounded-md text-white font-bold text-lg relative transition-all transform hover:scale-105">EVEN <span className="absolute top-1 right-2 text-xs opacity-80">{bets.even ? format(bets.even) : ''}</span></button>
                        <button onClick={() => placeBet('odd')} className="bg-purple-700/80 hover:bg-purple-600 p-4 rounded-md text-white font-bold text-lg relative transition-all transform hover:scale-105">ODD <span className="absolute top-1 right-2 text-xs opacity-80">{bets.odd ? format(bets.odd) : ''}</span></button>
                    </div>
                    <div className="flex justify-center space-x-2 my-4">
                        {chipValues.map(chip => (
                            <button key={chip} onClick={() => setSelectedChip(chip)} className={`w-12 h-12 rounded-full font-bold text-white transition-all border-2 flex items-center justify-center text-xs shadow-md ${selectedChip === chip ? 'border-gold-accent scale-110 shadow-glow-gold' : 'border-transparent opacity-70 hover:opacity-100'}`} style={{backgroundColor: '#5a482c'}}>
                                {chip < 1 ? chip.toFixed(3).replace('0.', '.') : chip}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleSpin} disabled={spinning || totalBet === 0} className="w-full mt-2 py-4 bg-gradient-to-b from-success/90 to-success text-black font-bold rounded-lg shadow-md text-xl transition-all transform hover:scale-105 hover:shadow-glow-success disabled:from-gray-600 disabled:to-gray-700 disabled:text-text-secondary disabled:scale-100 disabled:shadow-none">
                        {spinning ? 'Spinning...' : `SPIN (${format(totalBet)} ${currency})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Roulette;
