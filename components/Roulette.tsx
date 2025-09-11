import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { ExitIcon } from './Icons';
import { toast } from 'sonner';
import { GameMode } from '../types';

interface RouletteProps {
  onExit: () => void;
  gameMode: GameMode;
  realMoneyBalance: number;
  playMoneyBalance: number;
  setRealMoneyBalance: (updater: (prevBalance: number) => number) => void;
  setPlayMoneyBalance: (updater: (prevBalance: number) => number) => void;
}

type BetType = 'straight' | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'col1' | 'col2' | 'col3';
type Bet = { type: BetType; amount: number; value?: number };
type Bets = { [key: string]: Bet };

const wheelNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const numberPositions = wheelNumbers.reduce((acc, num, index) => {
  acc[num] = index;
  return acc;
}, {} as { [key: number]: number });

const getNumberColor = (num: number) => {
  if (num === 0) return 'green';
  return redNumbers.includes(num) ? 'red' : 'black';
};

const chipValuesPlayMoney = [10, 25, 100, 500];
const chipValuesRealMoney = [0.1, 0.5, 1, 5];

const Roulette: React.FC<RouletteProps> = ({ onExit, gameMode, realMoneyBalance, playMoneyBalance, setRealMoneyBalance, setPlayMoneyBalance }) => {
  const isRealMoney = gameMode === GameMode.REAL_MONEY;
  const balance = isRealMoney ? realMoneyBalance : playMoneyBalance;
  const setBalance = isRealMoney ? setRealMoneyBalance : setPlayMoneyBalance;
  const chipValues = isRealMoney ? chipValuesRealMoney : chipValuesPlayMoney;
  const currencySymbol = isRealMoney ? 'TON' : '$';

  const [bets, setBets] = useState<Bets>({});
  const [chipIndex, setChipIndex] = useState(0);
  const selectedChip = chipValues[chipIndex];

  const [phase, setPhase] = useState<'betting' | 'spinning' | 'result'>('betting');
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [spinStyle, setSpinStyle] = useState({});

  const totalBet = useMemo(() => Object.values(bets).reduce((sum, bet) => sum + bet.amount, 0), [bets]);

  const placeBet = (type: BetType, value?: number) => {
    if (phase !== 'betting' || balance < selectedChip) {
      if(balance < selectedChip) toast.error("Недостаточно средств для этой ставки");
      return;
    }
    const key = value !== undefined ? `${type}-${value}` : type;
    setBets(prev => ({
      ...prev,
      [key]: {
        type,
        value,
        amount: (prev[key]?.amount || 0) + selectedChip
      }
    }));
  };
  
  const calculateWinnings = useCallback((winningNum: number) => {
    let winnings = 0;
    const color = getNumberColor(winningNum);

    for (const key in bets) {
        const bet = bets[key];
        let win = false;
        let payout = 0;
        
        switch (bet.type) {
            case 'straight':
                if (bet.value === winningNum) { win = true; payout = 35; }
                break;
            case 'red':
                if (color === 'red') { win = true; payout = 1; }
                break;
            case 'black':
                if (color === 'black') { win = true; payout = 1; }
                break;
            case 'even':
                if (winningNum !== 0 && winningNum % 2 === 0) { win = true; payout = 1; }
                break;
            case 'odd':
                if (winningNum % 2 !== 0) { win = true; payout = 1; }
                break;
            case 'low':
                if (winningNum >= 1 && winningNum <= 18) { win = true; payout = 1; }
                break;
            case 'high':
                if (winningNum >= 19 && winningNum <= 36) { win = true; payout = 1; }
                break;
            case 'dozen1':
                if (winningNum >= 1 && winningNum <= 12) { win = true; payout = 2; }
                break;
            case 'dozen2':
                if (winningNum >= 13 && winningNum <= 24) { win = true; payout = 2; }
                break;
            case 'dozen3':
                if (winningNum >= 25 && winningNum <= 36) { win = true; payout = 2; }
                break;
            case 'col1':
                if (winningNum % 3 === 1) { win = true; payout = 2; }
                break;
            case 'col2':
                if (winningNum % 3 === 2) { win = true; payout = 2; }
                break;
            case 'col3':
                if (winningNum % 3 === 0 && winningNum !== 0) { win = true; payout = 2; }
                break;
        }

        if (win) {
            winnings += bet.amount + (bet.amount * payout);
        }
    }
    return winnings;
  }, [bets]);

  const handleSpin = () => {
    if (phase !== 'betting' || totalBet === 0 || balance < totalBet) {
      if (totalBet === 0) toast.error("Сделайте ставку");
      if (balance < totalBet) toast.error("Недостаточно средств для покрытия ставок");
      return;
    }

    setPhase('spinning');
    setWinAmount(0);
    setBalance(prev => prev - totalBet);

    const newWinningNumber = Math.floor(Math.random() * 37);
    setWinningNumber(newWinningNumber);

    const baseTurns = 4;
    const segmentAngle = 360 / 37;
    const finalAngle = (baseTurns * 360) + (numberPositions[newWinningNumber] * segmentAngle) + (Math.random() * segmentAngle - segmentAngle / 2);

    setSpinStyle({
      '--final-rotation': `${finalAngle}deg`
    });
    
    setTimeout(() => {
        const totalWinnings = calculateWinnings(newWinningNumber);
        setWinAmount(totalWinnings);
        if(totalWinnings > 0) {
            setBalance(prev => prev + totalWinnings);
        }
        
        setHistory(prev => [newWinningNumber, ...prev.slice(0, 14)]);
        setPhase('result');
        
        setTimeout(() => {
            setPhase('betting');
            setWinningNumber(null);
        }, 4000);
    }, 5000);
  };

  const clearBets = () => {
    if (phase !== 'betting') return;
    setBets({});
  }

  const rebet = () => {
    if (phase !== 'betting' || Object.keys(bets).length > 0) return;
    // For simplicity, we just inform the user. A proper implementation would save the last bet state.
    toast.info("Эта функция повторит вашу последнюю ставку. (WIP)");
  }
  
  const BetButton = ({ label, betType, betValue, className }: {label: string, betType: BetType, betValue?: number, className?: string}) => (
    <button onClick={() => placeBet(betType, betValue)} className={`relative p-2 flex items-center justify-center text-center font-bold border border-gold-accent/50 text-white hover:bg-gold-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`} disabled={phase !== 'betting'}>
      {label}
      {bets[`${betType}${betValue !== undefined ? `-${betValue}`: ''}`] && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-accent/80 flex items-center justify-center text-xs font-mono text-black shadow-lg">{bets[`${betType}${betValue !== undefined ? `-${betValue}`: ''}`].amount}</div>}
    </button>
  );

  return (
    <div className="w-full h-full text-white flex flex-col items-center justify-center p-2 sm:p-4 font-sans overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between">
         {/* Header */}
        <div className="w-full flex justify-between items-start p-2">
            <button onClick={onExit} className="flex items-center space-x-2 px-3 py-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors text-sm"><ExitIcon/><span>Лобби</span></button>
            <div className="text-center">
                <h1 className="text-3xl font-black text-gold-accent">РУЛЕТКА</h1>
                <p className="text-sm text-text-secondary">{isRealMoney ? 'Real Money' : 'Play Money'}</p>
            </div>
            <div className="w-[100px] text-right">
                <p className="text-xs text-text-secondary uppercase">Баланс</p>
                <p className="text-lg font-mono font-bold">{currencySymbol}{isRealMoney ? balance.toFixed(2) : balance.toLocaleString()}</p>
            </div>
        </div>

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full flex-grow">
            {/* Wheel */}
            <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
                <div className={`w-full h-full bg-green-900/50 rounded-full border-8 border-yellow-800 transition-transform duration-[5000ms] ease-out ${phase === 'spinning' ? 'animate-roulette-wheel-spin' : ''}`} style={spinStyle}>
                   {wheelNumbers.map((num, i) => (
                      <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * (360 / 37)}deg)` }}>
                          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] sm:border-l-[25px] sm:border-r-[25px] sm:border-b-[50px] border-l-transparent border-r-transparent ${getNumberColor(num) === 'red' ? 'border-b-danger' : getNumberColor(num) === 'black' ? 'border-b-gray-800' : 'border-b-success'}`}>
                            <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-xs text-white transform -rotate-90">{num}</span>
                          </div>
                      </div>
                  ))}
                </div>
                {/* Ball */}
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow-lg ${phase === 'spinning' ? 'animate-roulette-ball-spin' : 'hidden'}`} style={spinStyle} />
                <div className="absolute w-16 h-16 bg-yellow-900 rounded-full border-4 border-yellow-600"/>
                {winningNumber !== null && phase === 'result' && <div className="absolute text-4xl font-bold text-white drop-shadow-lg animate-fade-in">{winningNumber}</div>}
            </div>

            {/* Betting Table */}
             <div className="flex flex-col p-2 bg-green-900/80 border-2 border-gold-accent/50 rounded-lg">
                <div className="grid grid-cols-13 gap-0.5">
                    <div className="col-span-1 row-span-3 flex items-center justify-center"><BetButton label="0" betType="straight" betValue={0} className="bg-success/50"/></div>
                    {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map(n => <BetButton key={n} label={`${n}`} betType="straight" betValue={n} className="bg-danger/80" />)}
                    <BetButton label="2:1" betType="col3" className="bg-gold-accent/30"/>
                    {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map(n => <BetButton key={n} label={`${n}`} betType="straight" betValue={n} className="bg-gray-800" />)}
                    <BetButton label="2:1" betType="col2" className="bg-gold-accent/30"/>
                    {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map(n => <BetButton key={n} label={`${n}`} betType="straight" betValue={n} className="bg-danger/80"/>)}
                    <BetButton label="2:1" betType="col1" className="bg-gold-accent/30"/>
                </div>
                <div className="grid grid-cols-6 gap-0.5 mt-0.5">
                    <BetButton label="1-12" betType="dozen1" className="col-span-2 bg-gold-accent/30" />
                    <BetButton label="13-24" betType="dozen2" className="col-span-2 bg-gold-accent/30" />
                    <BetButton label="25-36" betType="dozen3" className="col-span-2 bg-gold-accent/30" />
                </div>
                <div className="grid grid-cols-6 gap-0.5 mt-0.5">
                    <BetButton label="1-18" betType="low" />
                    <BetButton label="Even" betType="even" />
                    <BetButton label="Red" betType="red" className="bg-danger/80"/>
                    <BetButton label="Black" betType="black" className="bg-gray-800"/>
                    <BetButton label="Odd" betType="odd" />
                    <BetButton label="19-36" betType="high" />
                </div>
            </div>
        </div>

        {/* History & Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between p-2 bg-black/50 rounded-lg">
            <div className="flex items-center gap-1">
                <span className="text-xs text-text-secondary mr-2">Last:</span>
                {history.map((num, i) => (
                    <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getNumberColor(num) === 'red' ? 'bg-danger' : getNumberColor(num) === 'black' ? 'bg-gray-800' : 'bg-success'}`}>{num}</div>
                ))}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 my-2 sm:my-0">
                <div className="text-center">
                    <p className="text-xs uppercase">Bet</p>
                    <p className="font-mono text-lg">{currencySymbol}{isRealMoney ? totalBet.toFixed(2) : totalBet.toLocaleString()}</p>
                </div>
                <div className="text-center text-success">
                    <p className="text-xs uppercase">Win</p>
                    <p className="font-mono text-lg">{currencySymbol}{isRealMoney ? winAmount.toFixed(2) : winAmount.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 bg-surface p-1 rounded-lg">
                    {chipValues.map((val, i) => (
                        <button key={val} onClick={() => setChipIndex(i)} className={`w-10 h-8 rounded-full text-xs font-bold transition-all ${chipIndex === i ? 'bg-primary-accent text-black scale-110' : 'bg-background-light'}`}>{val}</button>
                    ))}
                 </div>
                 <button onClick={clearBets} disabled={phase !== 'betting'} className="px-4 py-2 bg-surface hover:bg-background-light rounded-md font-semibold text-sm transition-colors disabled:opacity-50">Clear</button>
                 <button onClick={rebet} disabled={phase !== 'betting'} className="px-4 py-2 bg-surface hover:bg-background-light rounded-md font-semibold text-sm transition-colors disabled:opacity-50">Rebet</button>
                 <button onClick={handleSpin} disabled={phase !== 'betting'} className="py-2 px-8 bg-success text-black hover:bg-success/90 font-bold rounded-lg shadow-lg shadow-success/20 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:text-text-secondary disabled:opacity-50 disabled:scale-100 disabled:shadow-none">Spin</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;