import React, { useState, useContext } from 'react';
import { AssetContext } from '../contexts/AssetContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateGodMode: () => void;
  isAdmin: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onActivateGodMode, isAdmin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { assets } = useContext(AssetContext);

  if (!isOpen) return null;

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === assets.godModePassword) {
      onActivateGodMode();
      handleClose();
    } else {
      setError('Неверный код администратора.');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700 transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Настройки</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          {isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="god-mode-code" className="block text-sm font-medium text-gray-300 mb-2">
                  Режим Бога (админ)
                </label>
                <input
                  type="password"
                  id="god-mode-code"
                  value={code}
                  onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                  }}
                  placeholder="Введите код администратора"
                  className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Активировать
              </button>
            </form>
          )}

          {!isAdmin && (
            <div className="text-center text-gray-400">
                <p>Специальные настройки отсутствуют.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;