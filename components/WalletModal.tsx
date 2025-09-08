import React, { useState } from 'react';

// The administrator's Telegram username. Users will be sent here to complete the deposit.
const ADMIN_TELEGRAM_USERNAME = "nysha667"; 

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, currentBalance }) => {
  const [amount, setAmount] = useState('10');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Пожалуйста, введите корректную сумму.');
      return;
    }
    setError('');
    setIsLoading(true);

    const TWebApp = (window as any).Telegram?.WebApp;
    if (!TWebApp || !TWebApp.initData) {
        setError('Контекст Telegram WebApp недоступен.');
        setIsLoading(false);
        return;
    }

    try {
        const body = {
            web_view_init_data_raw: TWebApp.initData,
            ep: "attach+direct", // The newly discovered direct method
            receiver: ADMIN_TELEGRAM_USERNAME,
            amount: numericAmount.toString(),
            asset: "TON", // The primary asset for this app
        };

        const response = await fetch("https://walletbot.me/api/v1/users/auth/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Не удалось инициализировать платеж через API кошелька.');
        }
        
        const result = await response.json();
        
        // Based on community findings, the response should contain a deep link to open.
        // The exact structure might vary, so we check for common patterns.
        const paymentUrl = result?.data?.url || result?.url;

        if (paymentUrl && typeof paymentUrl === 'string') {
            TWebApp.openTelegramLink(paymentUrl);
            onClose(); // Close modal on success
        } else {
            console.error('Ответ API кошелька не содержит валидный URL для оплаты.', result);
            throw new Error('Получен неверный ответ от сервиса кошелька.');
        }

    } catch (err: any) {
        console.error('Ошибка инициализации платежа в кошельке:', err);
        setError(err.message || 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const resetAndClose = () => {
    setAmount('10');
    setError('');
    setIsLoading(false);
    onClose();
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Пополнение через Wallet</h2>
            <button onClick={resetAndClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-400">Текущий баланс</p>
            <p className="text-3xl font-mono text-cyan-400">{currentBalance.toFixed(4)} TON</p>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-4">
              Введите сумму в TON для пополнения. Вам будет предложено подтвердить транзакцию в вашем кошельке Telegram.
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
                  Инициализация...
                </>
              ) : 'Перейти к оплате'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;