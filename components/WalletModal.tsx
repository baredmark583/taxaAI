
import React, { useState } from 'react';
import { useTonConnectUI, useTonWallet, TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

// This is the club's treasury wallet address where deposits will be sent.
// IMPORTANT: Replace this with your own REAL wallet address for a live application.
// This is a sample TESTNET address. Do not send real TON to it.
const TREASURY_WALLET_ADDRESS = "UQARnCdfRw0VcT86ApqHJEdMGzQU3T_MnPbNs71A6nOXcF91";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const [amount, setAmount] = useState('10');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();

  if (!isOpen) return null;

  const handleDeposit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Пожалуйста, введите корректную сумму.');
      return;
    }
    if (!wallet) {
      setError('Кошелек не подключен.');
      return;
    }
    setError('');
    setIsLoading(true);

    // The transaction object required by TON Connect
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
      messages: [
        {
          address: TREASURY_WALLET_ADDRESS,
          // Amount in nanotons (1 TON = 1,000,000,000 nanotons)
          amount: (numericAmount * 1_000_000_000).toString(),
        },
      ],
    };

    try {
      // Send the transaction to the user's wallet for confirmation
      await tonConnectUI.sendTransaction(transaction);

      // IMPORTANT: In a real app, you don't credit the user's balance here.
      // You wait for a backend service to confirm the transaction on the blockchain
      // and then update the user's balance. This is for UI feedback only.
      alert('Транзакция отправлена! Баланс будет обновлен после подтверждения в сети TON.');
      resetAndClose();
    } catch (err) {
      console.error('Ошибка отправки транзакции:', err);
      setError('Транзакция была отклонена или произошла ошибка.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setAmount('10');
    setError('');
    setIsLoading(false);
    onClose();
  };

  const renderContent = () => {
    if (!wallet) {
      return (
        <div className="text-center">
          <p className="text-gray-300 mb-6">
            Подключите ваш кошелек TON, чтобы пополнить баланс.
          </p>
          <div className="flex justify-center">
            <TonConnectButton />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-gray-900 p-3 rounded-lg mb-4 text-center">
            <p className="text-xs text-gray-400">Подключен кошелек:</p>
            <p className="text-sm font-mono text-cyan-400 break-all">{userFriendlyAddress}</p>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Введите сумму в TON для пополнения. Вам будет предложено подтвердить транзакцию.
        </p>
        <div className="mb-4">
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-300 mb-2">
            Сумма (TON)
          </label>
          <div className="relative">
            <input
              type="number"
              id="deposit-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 10"
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">TON</span>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <button
          onClick={handleDeposit}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ожидание подтверждения...
            </>
          ) : 'Пополнить'}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Управление кошельком</h2>
            <button onClick={resetAndClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-400">Текущий баланс в игре</p>
            <p className="text-3xl font-mono text-cyan-400">{currentBalance.toFixed(4)} TON</p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
