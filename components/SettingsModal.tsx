import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateGodMode: () => void;
  isAdmin: boolean;
}

const GOD_MODE_CODE = 'reveal_cards_42';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onActivateGodMode, isAdmin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === GOD_MODE_CODE) {
      onActivateGodMode();
      handleClose();
    } else {
      setError('Invalid admin code.');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700 transform transition-all duration-300 scale-100 animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          {isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="god-mode-code" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin God Mode
                </label>
                <input
                  type="password"
                  id="god-mode-code"
                  value={code}
                  onChange={(e) => {
                      setCode(e.target.value);
                      setError('');
                  }}
                  placeholder="Enter admin code"
                  className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Activate
              </button>
            </form>
          )}

          {!isAdmin && (
            <div className="text-center text-gray-400">
                <p>No special settings available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;