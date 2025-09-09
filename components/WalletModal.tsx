import React, { useState } from 'react';
import { useTonConnectUI, useTonWallet, TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

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

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
      messages: [
        {
          address: TREASURY_WALLET_ADDRESS,
          amount: (numericAmount * 1_000_000_000).toString(),
        },
      ],
    };

    try {
      await tonConnectUI.sendTransaction(transaction);
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
          <p className="text-text-secondary mb-6">
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
        <div className="bg-background-dark p-3 rounded-lg mb-4 text-center">
            <p className="text-xs text-text-secondary">Подключен кошелек:</p>
            <p className="text-sm font-mono text-primary-accent break-all">{userFriendlyAddress}</p>
        </div>
        <p className="text-sm text-text-secondary mb-4">
          Введите сумму в TON для пополнения.
        </p>
        <div className="mb-4">
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-text-secondary mb-2">
            Сумма (TON)
          </label>
          <div className="relative">
            <input
              type="number"
              id="deposit-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 10"
              className="w-full bg-background-dark text-white border border-brand-border rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary-accent"
              disabled={isLoading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">TON</span>
          </div>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </div>
        <button
          onClick={handleDeposit}
          disabled={isLoading}
          className="w-full bg-primary-accent hover:bg-primary-accent/80 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
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
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-md border border-brand-border transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Управление кошельком</h2>
            <button onClick={resetAndClose} className="text-text-secondary hover:text-white text-3xl leading-none">&times;</button>
          </div>
          <div className="bg-background-dark p-4 rounded-lg mb-6">
            <p className="text-sm text-text-secondary">Текущий баланс в игре</p>
            <p className="text-3xl font-mono text-primary-accent">{currentBalance.toFixed(4)} TON</p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
