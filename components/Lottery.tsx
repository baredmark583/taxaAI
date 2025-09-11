import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GameMode, LotteryPrize } from '../types';
import { ExitIcon } from './Icons';
import { cn } from '@/lib/utils';

interface LotteryProps {
  onExit: () => void;
  gameMode: GameMode;
  realMoneyBalance: number;
  playMoneyBalance: number;
  setRealMoneyBalance: (updater: (prevBalance: number) => number) => void;
  setPlayMoneyBalance: (updater: (prevBalance: number) => number) => void;
  ticketPricePlayMoney: number;
  ticketPriceRealMoney: number;
  prizesPlayMoney: LotteryPrize[];
  prizesRealMoney: LotteryPrize[];
}

const Lottery: React.FC<LotteryProps> = ({
  onExit,
  gameMode,
  realMoneyBalance,
  playMoneyBalance,
  setRealMoneyBalance,
  setPlayMoneyBalance,
  ticketPricePlayMoney,
  ticketPriceRealMoney,
  prizesPlayMoney,
  prizesRealMoney,
}) => {
  const isRealMoney = gameMode === GameMode.REAL_MONEY;
  const balance = isRealMoney ? realMoneyBalance : playMoneyBalance;
  const setBalance = isRealMoney ? setRealMoneyBalance : setPlayMoneyBalance;
  const ticketPrice = isRealMoney ? ticketPriceRealMoney : ticketPricePlayMoney;
  const prizes = isRealMoney ? prizesRealMoney : prizesPlayMoney;
  const currencySymbol = isRealMoney ? 'TON' : '$';

  const [ticketState, setTicketState] = useState<'idle' | 'bought' | 'revealing' | 'revealed'>('idle');
  const [winnings, setWinnings] = useState<number | null>(null);
  const [prizeLabel, setPrizeLabel] = useState('');

  const formatAmount = (amount: number) => {
    return isRealMoney ? amount.toFixed(4) : amount.toLocaleString();
  };
  
  const calculateWinnings = () => {
      const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const prize of prizes) {
          if (random < prize.weight) {
              return { amount: ticketPrice * (prize.multiplier / 100), label: prize.label };
          }
          random -= prize.weight;
      }
      return { amount: 0, label: 'Не повезло' }; // Fallback
  }

  const handleBuyTicket = useCallback(() => {
    if (balance < ticketPrice) {
      toast.error('Недостаточно средств для покупки билета');
      return;
    }
    setBalance(prev => prev - ticketPrice);
    setWinnings(null);
    setPrizeLabel('');
    setTicketState('bought');
  }, [balance, ticketPrice, setBalance]);

  const handleRevealTicket = () => {
    if (ticketState !== 'bought') return;

    setTicketState('revealing');
    const result = calculateWinnings();
    
    setTimeout(() => {
      setWinnings(result.amount);
      setPrizeLabel(result.label);
      if (result.amount > 0) {
        setBalance(prev => prev + result.amount);
      }
      setTicketState('revealed');
    }, 500); // Corresponds to animation duration
  };

  const handlePlayAgain = () => {
    setTicketState('idle');
    setWinnings(null);
    setPrizeLabel('');
  };

  return (
    <div className="w-full h-full text-white flex flex-col items-center justify-center p-4 font-sans bg-gradient-to-b from-purple-900 to-indigo-900">
      <div className="relative z-10 w-full max-w-md mx-auto text-center">
        <div className="absolute top-4 left-4">
           <button onClick={onExit} className="flex items-center space-x-2 px-3 py-2 bg-black/50 hover:bg-black/80 rounded-lg transition-colors text-sm"><ExitIcon/><span>Лобби</span></button>
        </div>
        
        <h1 className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-[0_0_15px_rgba(255,217,0,0.6)] mb-2">
          МГНОВЕННАЯ ЛОТЕРЕЯ
        </h1>
        <p className="text-lg text-yellow-200/80 mb-4">{isRealMoney ? 'Real Money' : 'Play Money'}</p>

        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl mb-6 border border-yellow-500/30">
          <p className="text-sm text-yellow-200/70">Баланс</p>
          <p className="text-3xl font-mono">{currencySymbol}{formatAmount(balance)}</p>
        </div>

        <div className="relative w-full aspect-[4/3] flex items-center justify-center">
          {ticketState === 'idle' && (
            <div className="animate-fade-in">
              <p className="mb-4 text-lg">Стоимость билета: <span className="font-bold">{currencySymbol}{formatAmount(ticketPrice)}</span></p>
              <button
                onClick={handleBuyTicket}
                className="px-8 py-4 bg-success text-black font-bold text-xl uppercase rounded-lg shadow-lg shadow-success/30 transition-all transform hover:scale-105 disabled:opacity-50"
                disabled={balance < ticketPrice}
              >
                Купить билет
              </button>
            </div>
          )}

          {(ticketState === 'bought' || ticketState === 'revealing') && (
            <div
              className="w-64 h-48 cursor-pointer [perspective:1000px]"
              onClick={handleRevealTicket}
            >
               <div className={cn(
                    "relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]",
                    ticketState === 'revealing' && '[transform:rotateY(180deg)]'
                )}>
                    {/* Front of the ticket */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-4 flex flex-col items-center justify-center shadow-2xl">
                        <h3 className="text-2xl font-bold text-black">Счастливый Билет</h3>
                        <p className="text-black/70 mt-2">Нажмите, чтобы открыть</p>
                    </div>
                    {/* Back of the ticket (hidden until revealed) */}
                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
                    </div>
                </div>
            </div>
          )}

          {ticketState === 'revealed' && winnings !== null && (
            <div className="animate-fade-in w-64 h-48 bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center shadow-2xl">
              <h3 className="text-xl font-bold mb-2">{prizeLabel}</h3>
              {winnings > 0 ? (
                <>
                  <p className="text-sm text-success">Выигрыш!</p>
                  <p className="text-4xl font-mono text-success animate-pulse">{currencySymbol}{formatAmount(winnings)}</p>
                </>
              ) : (
                <p className="text-2xl text-danger">Не повезло в этот раз</p>
              )}
               <button
                onClick={handlePlayAgain}
                className="mt-4 px-6 py-2 bg-primary-accent text-black font-bold rounded-lg transition-transform transform hover:scale-105"
              >
                Играть снова
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lottery;