import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AssetContext } from '../contexts/AssetContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateGodMode: () => void;
  isAdmin: boolean;
  onSettingsChange: (settings: { cardBackUrl?: string; showInBB?: boolean }) => void;
}

const predefinedCardBacks = [
    { name: 'Default', url: 'https://www.svgrepo.com/show/424339/poker-gambling-game.svg' },
    { name: 'Blue', url: 'https://raw.githubusercontent.com/htdebeer/SVG-cards/main/cards/Blue_back.svg' },
    { name: 'Red', url: 'https://raw.githubusercontent.com/htdebeer/SVG-cards/main/cards/Red_back.svg' },
    { name: 'Abstract', url: 'https://www.svgrepo.com/show/472548/card-back.svg' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onActivateGodMode, isAdmin, onSettingsChange }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { assets } = useContext(AssetContext);

  const [selectedBack, setSelectedBack] = useState(assets.cardBackUrl);
  const [showInBB, setShowInBB] = useState(false);

  useEffect(() => {
    if (isOpen) {
        try {
            const savedSettings = localStorage.getItem('pokerUserSettings');
            if (savedSettings) {
                const { cardBackUrl, showInBB } = JSON.parse(savedSettings);
                setSelectedBack(cardBackUrl || assets.cardBackUrl);
                setShowInBB(!!showInBB);
            } else {
                 setSelectedBack(assets.cardBackUrl);
            }
        } catch (e) {
            console.error("Could not parse settings from localStorage", e);
            setSelectedBack(assets.cardBackUrl);
        }
    }
  }, [isOpen, assets.cardBackUrl]);
  
  const saveSettings = useCallback(() => {
     try {
        const settings = { cardBackUrl: selectedBack, showInBB };
        localStorage.setItem('pokerUserSettings', JSON.stringify(settings));
        onSettingsChange(settings);
     } catch(e) {
        console.error("Could not save settings to localStorage", e);
     }
  }, [selectedBack, showInBB, onSettingsChange]);

  useEffect(() => {
    if(isOpen) {
        saveSettings();
    }
  }, [selectedBack, showInBB, isOpen, saveSettings]);

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
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-background-light rounded-2xl shadow-2xl w-full max-w-sm border border-brand-border transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Настройки</h2>
            <button onClick={handleClose} className="text-text-secondary hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Внешний вид</label>
              <div className="p-3 bg-surface rounded-lg">
                <p className="text-xs text-text-secondary mb-2">Рубашка карт</p>
                <div className="grid grid-cols-4 gap-2">
                    {predefinedCardBacks.map(back => (
                        <button key={back.name} onClick={() => setSelectedBack(back.url)} className={`w-full h-16 bg-white bg-cover bg-center rounded-md border-2 transition-all ${selectedBack === back.url ? 'border-primary-accent scale-105 shadow-glow-primary' : 'border-transparent opacity-70 hover:opacity-100'}`} style={{backgroundImage: `url(${back.url})`}} title={back.name} />
                    ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Игровой процесс</label>
               <div className="p-3 bg-surface rounded-lg flex items-center justify-between">
                    <span className="text-text-primary">Показывать ставки в ББ</span>
                    <button onClick={() => setShowInBB(!showInBB)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${showInBB ? 'bg-primary-accent' : 'bg-background-dark'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showInBB ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
            </div>
            
            {isAdmin && (
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-brand-border">
                <div>
                  <label htmlFor="god-mode-code" className="block text-sm font-medium text-text-secondary mb-2">
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
                    className="w-full bg-background-dark text-white border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-accent"
                  />
                  {error && <p className="text-danger text-xs mt-2">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-accent hover:bg-primary-accent/80 text-black font-bold py-2 rounded-lg transition-colors"
                >
                  Активировать
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
