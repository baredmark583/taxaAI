
import React from 'react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onDeposit: (amount: number) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, currentBalance, onDeposit }) => {
  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add a small visual feedback if desired
  };
  
  const walletAddress = "0x1234...AbCdEfG56789";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Crypto Wallet</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-400">Current Balance</p>
            <p className="text-3xl font-mono text-cyan-400">{currentBalance.toFixed(4)} ETH</p>
          </div>

          <div className="text-center bg-gray-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-white">Deposit ETH</h3>
            <p className="text-sm text-gray-400 mb-4">Send ETH to the address below to fund your account. This is a simulation.</p>
            {/* Fake QR Code */}
            <div className="bg-white p-2 rounded-lg inline-block mb-4">
              <svg width="140" height="140" viewBox="0 0 100 100" className="bg-white">
                <path d="M0 0 H20 V20 H0 Z M80 0 H100 V20 H80 Z M0 80 H20 V100 H0 Z M30 0 H40 V10 H30 Z M50 0 H60 V10 H50 Z M0 30 H10 V40 H0 Z M0 50 H10 V60 H0 Z M90 30 H100 V40 H90 Z M90 50 H100 V60 H90 Z M30 90 H40 V100 H30 Z M50 90 H60 V100 H50 Z M30 30 H70 V70 H30 Z M25 25 H75 V75 H25 Z M40 40 H60 V60 H40 Z" fill="black"/>
              </svg>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm font-mono text-gray-300 break-all">{walletAddress}</span>
              <button onClick={() => handleCopy(walletAddress)} className="ml-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-1 px-2 rounded text-xs">
                COPY
              </button>
            </div>
          </div>

          {/* This button is for simulation purposes */}
          <button 
            onClick={() => { onDeposit(0.1); onClose(); }} 
            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Simulate 0.1 ETH Deposit
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
