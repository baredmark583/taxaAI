import React from 'react';
import { Player as PlayerType, Card as CardType, GameStage } from '../types';
import Card from './Card';
import { DealerChipIcon } from './Icons';

interface PlayerProps {
  player: PlayerType;
  isMainPlayer?: boolean;
  isDealer?: boolean;
  godMode?: boolean;
  cardBackUrl?: string;
  formatDisplayAmount: (amount: number) => string;
  isWinner?: boolean;
  winningHand?: CardType[];
  stage: GameStage;
  amountWon?: number;
}

const PlayerAvatar: React.FC<{ player: PlayerType }> = ({ player }) => {
    const initials = player.name.substring(0, 2).toUpperCase();
    
    if (player.photoUrl) {
        return <img src={player.photoUrl} alt={player.name} className="w-12 h-12 rounded-full border-2 border-gold-accent object-cover bg-background-light" />;
    }
    
    return (
        <div className="w-12 h-12 rounded-full border-2 border-gold-accent bg-background-light flex items-center justify-center">
            <span className="text-lg font-bold text-text-primary">{initials}</span>
        </div>
    );
};


const Player: React.FC<PlayerProps> = ({ player, isMainPlayer, isDealer, godMode, cardBackUrl, formatDisplayAmount, isWinner, winningHand = [], stage, amountWon }) => {
    const isFolded = player.isFolded;
    const isActive = player.isActive;

    const showCards = isMainPlayer || godMode || (!isFolded && stage === GameStage.SHOWDOWN);
    const showHand = player.hand && player.hand.length > 0;

    const isCardInWinningHand = (card: CardType) => {
        return winningHand.some(whCard => whCard.rank === card.rank && whCard.suit === card.suit);
    }

    return (
        <div className={`relative flex flex-col items-center transition-all duration-300 w-32 ${isFolded ? 'opacity-50' : ''} ${isActive ? 'scale-110 shadow-glow-primary rounded-lg z-10' : ''}`}>
            {isWinner && <div className="absolute -inset-2 animate-firework rounded-full pointer-events-none" />}

            {/* 1. Cards */}
            <div className={`relative flex items-end justify-center h-16 ${isMainPlayer ? '' : 'transform scale-90 -mb-2'}`}>
                {showHand && !isFolded && (
                    <div className={`flex items-center ${isMainPlayer ? '-space-x-12' : '-space-x-8'}`}>
                        {player.hand?.[0] && (
                            <div className="transform -rotate-12">
                                <Card 
                                    card={player.hand[0]} 
                                    revealed={showCards}
                                    overrideBackUrl={cardBackUrl}
                                    isHighlighted={isWinner && showCards && isCardInWinningHand(player.hand[0])}
                                    size={isMainPlayer ? 'normal' : 'small'}
                                />
                            </div>
                        )}
                        {player.hand?.[1] && (
                            <div className="transform rotate-12">
                                <Card 
                                    card={player.hand[1]} 
                                    revealed={showCards}
                                    overrideBackUrl={cardBackUrl}
                                    isHighlighted={isWinner && showCards && isCardInWinningHand(player.hand[1])}
                                    size={isMainPlayer ? 'normal' : 'small'}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Avatar & Info Bubble (pulled up to overlap cards) */}
            <div className="relative flex flex-col items-center -mt-8 w-full">
                <div className="relative z-10">
                    <PlayerAvatar player={player} />
                    {isDealer && (
                        <div className="absolute -top-1 -right-2 text-white transform-gpu animate-pulse">
                            <DealerChipIcon className="w-6 h-6 bg-white text-black rounded-full p-0.5 shadow-lg" />
                        </div>
                    )}
                </div>

                <div className={`w-full max-w-[120px] bg-black/70 backdrop-blur-sm border border-brand-border rounded-lg px-3 py-1 text-center -mt-6 ${isWinner ? 'border-gold-accent shadow-glow-gold' : ''}`}>
                    <p className="text-sm font-bold truncate pt-6">{player.name}</p>
                    <p className={`text-base font-mono ${player.stack > 0 ? 'text-white' : 'text-danger'}`}>{formatDisplayAmount(player.stack)}</p>
                </div>
            </div>

            {/* 3. Bet Bubble */}
            {player.bet > 0 && (
                <div className="mt-2 bg-background-dark border border-gold-accent text-gold-accent px-2 py-0.5 rounded-full text-xs font-mono shadow-md">
                    {formatDisplayAmount(player.bet)}
                </div>
            )}
            
            {/* Overlays */}
            {amountWon && amountWon > 0 && (
                <div className="absolute top-1/2 -translate-y-1/2 text-success font-bold text-sm animate-prize-up whitespace-nowrap">
                    + {formatDisplayAmount(amountWon)}
                </div>
            )}
             {isWinner && (
                <div className="absolute bg-gold-accent text-black px-2 py-0.5 rounded-md text-xs font-bold shadow-lg uppercase tracking-wider z-20" style={{top: '30%'}}>
                    WINNER
                </div>
            )}
        </div>
    );
};

export default Player;