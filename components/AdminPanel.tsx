import React, { useState, useContext, useEffect } from 'react';
import { AdminUser, Rank, Suit, SlotSymbol } from '../types';
import { AssetContext } from '../contexts/AssetContext';
import { ExitIcon } from './Icons';

interface AdminPanelProps {
  onExit: () => void;
  isBrowserView?: boolean;
}

// FIX: Cast import.meta to any to access env properties without vite/client types, resolving a TypeScript error.
const API_URL = (import.meta as any).env.VITE_API_URL;

const SUITS_ORDERED = Object.values(Suit);
const RANKS_ORDERED = Object.values(Rank);

const suitTranslations: Record<Suit, string> = {
    [Suit.HEARTS]: 'Червы',
    [Suit.DIAMONDS]: 'Бубны',
    [Suit.CLUBS]: 'Трефы',
    [Suit.SPADES]: 'Пики',
};


const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-700 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 flex justify-between items-center">
                <span className="font-semibold">{title}</span>
                <span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="p-4">{children}</div>}
        </div>
    )
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit, isBrowserView }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const { assets, setAssets } = useContext(AssetContext);
    const [localAssets, setLocalAssets] = useState(assets);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const usersResponse = await fetch(`${API_URL}/api/users`);
            const usersData = await usersResponse.json();
            setUsers(usersData);

            const assetsResponse = await fetch(`${API_URL}/api/assets`);
            const assetsData = await assetsResponse.json();
            if (assetsData) {
              setAssets(assetsData);
              setLocalAssets(assetsData);
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
            alert("Не удалось подключиться к серверу для получения данных.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);


    const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalAssets({ ...localAssets, [e.target.name]: e.target.value });
    };

    const handleCardFaceChange = (suit: Suit, rank: Rank, value: string) => {
        setLocalAssets(prev => ({
            ...prev,
            cardFaces: {
                ...prev.cardFaces,
                [suit]: {
                    ...prev.cardFaces[suit],
                    [rank]: value,
                }
            }
        }));
    };

    const handleSlotSymbolChange = (index: number, field: keyof SlotSymbol, value: string | number) => {
        const updatedSymbols = [...localAssets.slotSymbols];
        const symbolToUpdate = { ...updatedSymbols[index] };
        
        if (field === 'payout' || field === 'weight') {
             (symbolToUpdate[field] as number) = Number(value)
        } else {
            (symbolToUpdate[field] as string) = String(value);
        }

        updatedSymbols[index] = symbolToUpdate;
        setLocalAssets(prev => ({ ...prev, slotSymbols: updatedSymbols }));
    };

    const addSlotSymbol = () => {
        const newSymbol: SlotSymbol = { name: 'Новый символ', imageUrl: '', payout: 10, weight: 1 };
        setLocalAssets(prev => ({...prev, slotSymbols: [...prev.slotSymbols, newSymbol]}));
    }

    const removeSlotSymbol = (index: number) => {
        const updatedSymbols = localAssets.slotSymbols.filter((_, i) => i !== index);
        setLocalAssets(prev => ({...prev, slotSymbols: updatedSymbols}));
    }


    const saveAssets = async () => {
        try {
            const response = await fetch(`${API_URL}/api/assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localAssets),
            });
            if (!response.ok) throw new Error('Failed to save assets');
            const updatedAssets = await response.json();
            setAssets(updatedAssets);
            alert('Настройки сохранены!');
        } catch (error) {
            console.error(error);
            alert('Ошибка сохранения настроек.');
        }
    };

    const resetAssets = async () => {
       try {
            const response = await fetch(`${API_URL}/api/assets/reset`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to reset assets');
            const defaultAssets = await response.json();
            setLocalAssets(defaultAssets);
            setAssets(defaultAssets);
            alert('Настройки сброшены по умолчанию!');
        } catch (error) {
            console.error(error);
            alert('Ошибка сброса настроек.');
        }
    };
    
    const grantReward = async (userId: string) => {
        const amountStr = prompt(`Введите сумму игровых денег для пользователя ${userId}:`);
        if (amountStr) {
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
                try {
                    const response = await fetch(`${API_URL}/api/users/${userId}/reward`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount }),
                    });
                    if (!response.ok) throw new Error('Failed to grant reward');
                    const updatedUser = await response.json();
                    setUsers(users.map(u => u.id === userId ? updatedUser : u));
                    alert(`Выдано ${amount} игровых денег пользователю ${userId}.`);
                } catch (error) {
                     console.error(error);
                     alert('Ошибка выдачи награды.');
                }
            } else {
                alert('Неверная сумма.');
            }
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update role');
            }
            const updatedUser = await response.json();
            setUsers(users.map(u => u.id === userId ? updatedUser : u));
            alert(`Роль пользователя ${updatedUser.name} изменена на ${newRole}.`);
        } catch (error) {
            console.error(error);
            alert(`Ошибка изменения роли: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-900/50 z-20">
                <button onClick={onExit} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <ExitIcon className="w-6 h-6" />
                    <span>{isBrowserView ? 'Выйти' : 'Лобби'}</span>
                </button>
                <h1 className="text-xl font-bold text-cyan-400">Панель администратора</h1>
                <div className="w-24"></div>
            </div>

            <div className="max-w-7xl mx-auto pt-20 space-y-8">
                {isLoading ? (
                    <div className="text-center">
                        <p className="text-lg">Загрузка данных...</p>
                    </div>
                ) : (
                <>
                {/* Player Management */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-white">Управление игроками</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700/50 text-xs text-gray-300 uppercase tracking-wider">
                                <tr>
                                    <th className="p-3">Игрок</th>
                                    <th className="p-3">Игровые деньги</th>
                                    <th className="p-3">Реальные деньги (ETH)</th>
                                    <th className="p-3">Роль</th>
                                    <th className="p-3">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-700/50">
                                        <td className="p-3 font-semibold">{user.name} <span className="text-xs text-gray-400">({user.id})</span></td>
                                        <td className="p-3 font-mono">${user.playMoney.toLocaleString()}</td>
                                        <td className="p-3 font-mono">{user.realMoney.toFixed(4)}</td>
                                        <td className="p-3">
                                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                              user.role === 'ADMIN' ? 'bg-red-600 text-white' :
                                              user.role === 'MODERATOR' ? 'bg-cyan-500 text-white' :
                                              'bg-gray-600 text-gray-200'
                                          }`}>
                                              {user.role}
                                          </span>
                                        </td>
                                        <td className="p-3">
                                          <div className="flex items-center space-x-2">
                                              <button onClick={() => grantReward(user.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1 rounded-md text-sm">
                                                  Выдать награду
                                              </button>
                                              {user.role !== 'ADMIN' && (
                                                   <select
                                                      value={user.role}
                                                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                      className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                                                  >
                                                      <option value="PLAYER">Сделать игроком</option>
                                                      <option value="MODERATOR">Сделать модератором</option>
                                                  </select>
                                              )}
                                          </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Asset Customization */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Настройка ассетов</h2>
                        <div className="flex space-x-4">
                            <button onClick={saveAssets} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-md">Сохранить все изменения</button>
                            <button onClick={resetAssets} className="bg-gray-600 hover:bg-gray-500 text-white font-bold px-6 py-2 rounded-md">Сбросить по умолчанию</button>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {/* General Assets */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-cyan-400 border-b border-gray-600 pb-2">Общие</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">URL рубашки карт</label>
                                <input type="text" name="cardBackUrl" value={localAssets.cardBackUrl} onChange={handleAssetChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">URL фона стола</label>
                                <input type="text" name="tableBackgroundUrl" value={localAssets.tableBackgroundUrl} onChange={handleAssetChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Пароль для режима бога</label>
                                <input type="text" name="godModePassword" value={localAssets.godModePassword || ''} onChange={handleAssetChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            </div>
                        </div>

                        {/* Card Faces */}
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 border-b border-gray-600 pb-2 mb-4">Изображения карт</h3>
                            <div className="space-y-2">
                            {SUITS_ORDERED.map(suit => (
                                <CollapsibleSection key={suit} title={suitTranslations[suit]}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {RANKS_ORDERED.map(rank => (
                                            <div key={rank}>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Ранг {rank}</label>
                                                <input
                                                    type="text"
                                                    value={localAssets.cardFaces[suit]?.[rank] || ''}
                                                    onChange={e => handleCardFaceChange(suit, rank, e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleSection>
                            ))}
                            </div>
                        </div>

                        {/* Slot Symbols */}
                        <div>
                             <h3 className="text-xl font-semibold text-cyan-400 border-b border-gray-600 pb-2 mb-4">Символы слот-машины</h3>
                             <div className="space-y-4">
                                {localAssets.slotSymbols.map((symbol, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-3 items-center bg-gray-900/50 p-3 rounded-lg">
                                        <div className="col-span-3">
                                            <label className="text-xs text-gray-400">Название</label>
                                            <input type="text" value={symbol.name} onChange={e => handleSlotSymbolChange(index, 'name', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"/>
                                        </div>
                                         <div className="col-span-5">
                                            <label className="text-xs text-gray-400">URL изображения</label>
                                            <input type="text" value={symbol.imageUrl} onChange={e => handleSlotSymbolChange(index, 'imageUrl', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"/>
                                        </div>
                                         <div className="col-span-1">
                                            <label className="text-xs text-gray-400">Выплата</label>
                                            <input type="number" value={symbol.payout} onChange={e => handleSlotSymbolChange(index, 'payout', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"/>
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-xs text-gray-400">Вес (редкость)</label>
                                            <input type="number" value={symbol.weight} onChange={e => handleSlotSymbolChange(index, 'weight', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"/>
                                        </div>
                                        <div className="col-span-2 flex justify-end">
                                            <button onClick={() => removeSlotSymbol(index)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-md text-sm mt-4">
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                             <button onClick={addSlotSymbol} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-md text-sm">
                                Добавить новый символ
                             </button>
                        </div>

                    </div>
                </div>
                </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;