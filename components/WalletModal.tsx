import React, { useState } from 'react';

// This is a placeholder for your project's wallet address in the TON network.
// In a real application, this would come from a secure configuration.
const YOUR_PROJECT_WALLET_ADDRESS = "UQBF9gBv23d_9u_G-P6z_4J-x_9qZ_cE-r_tO-y_jHP"; // Example address

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [amount, setAmount] = useState('10');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreateInvoice = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setError('');

    // Generate a unique comment for tracking the payment on the backend.
    const comment = `deposit_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // This is the deep link format for Telegram's @Wallet.
    const url = `https://t.me/wallet/transfer?address=${YOUR_PROJECT_WALLET_ADDRESS}&amount=${numericAmount}&comment=${comment}`;
    
    setPaymentUrl(url);
    setStep('confirm');
  };

  const handlePay = () => {
    if (paymentUrl) {
      (window as any).Telegram?.WebApp?.openTelegramLink(paymentUrl);
      // We close the modal as the user is now interacting with Telegram Wallet
      onClose();
    }
  };
  
  const reset = () => {
    setStep('input');
    setAmount('10');
    setPaymentUrl('');
    setError('');
  }

  const handleClose = () => {
    reset();
    onClose();
  }
  
  const renderInputStep = () => (
    <>
      <h3 className="text-lg font-semibold mb-2 text-white">Deposit TON</h3>
      <p className="text-sm text-gray-400 mb-4">Enter the amount of TON you wish to deposit into your account.</p>
      <div className="mb-4">
        <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-300 mb-2">
          Amount (TON)
        </label>
        <div className="relative">
          <input
            type="number"
            id="deposit-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 10"
            className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">TON</span>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
      <button 
        onClick={handleCreateInvoice} 
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-colors"
      >
        Create Invoice
      </button>
    </>
  );

  const renderConfirmStep = () => (
    <>
       <h3 className="text-lg font-semibold mb-2 text-white">Confirm Deposit</h3>
       <p className="text-sm text-gray-400 mb-4">
         You are about to deposit <span className="font-bold text-cyan-400">{amount} TON</span>. 
         Click the button below to complete the payment using your Telegram Wallet.
       </p>
       <div className="bg-gray-900 p-4 rounded-lg my-6 text-center">
            <p className="text-gray-300">Your balance will be updated automatically after the transaction is confirmed.</p>
       </div>
       <div className="space-y-3">
            <button 
              onClick={handlePay} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Pay with Telegram Wallet
            </button>
             <button 
              onClick={reset} 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
       </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Crypto Wallet</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-400">Current Balance</p>
            <p className="text-3xl font-mono text-cyan-400">{currentBalance.toFixed(4)} TON</p>
          </div>

          {step === 'input' ? renderInputStep() : renderConfirmStep()}
          
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
