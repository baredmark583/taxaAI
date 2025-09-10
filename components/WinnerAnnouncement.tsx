
import React from 'react';
import { WinnerInfo } from '../types';

interface WinnerAnnouncementProps {
    winners: WinnerInfo[];
}

const WinnerAnnouncement: React.FC<WinnerAnnouncementProps> = ({ winners }) => {
    if (winners.length === 0) {
        return null;
    }

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 animate-fade-in p-4">
            <div className="bg-background-light p-6 rounded-lg shadow-2xl text-center border-2 border-gold-accent max-w-md w-full">
                <h2 className="text-3xl font-bold text-gold-accent mb-4 drop-shadow-[0_0_8px_rgba(255,215,0,0.7)]">
                    {winners.length > 1 ? 'Split Pot!' : 'Winner!'}
                </h2>
                <div className="space-y-4">
                    {winners.map((winner) => (
                        <div key={winner.playerId} className="animate-fade-in-up">
                            <p className="text-xl text-white">
                                <span className="font-bold">{winner.name}</span> wins <span className="font-mono text-primary-accent">{winner.amountWon.toLocaleString()}</span>
                            </p>
                            <p className="text-text-secondary text-md font-semibold">
                                with {winner.handRank}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="w-full bg-surface rounded-full h-1.5 mt-6 overflow-hidden">
                    <div className="bg-primary-accent h-1.5 rounded-full animate-progress-bar"></div>
                </div>
            </div>
        </div>
    );
};

export default WinnerAnnouncement;