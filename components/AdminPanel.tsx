import React, { useState, useContext, useEffect } from 'react';
import { AdminUser } from '../types';
import { AssetContext } from '../contexts/AssetContext';
import { ExitIcon } from './Icons';

interface AdminPanelProps {
  onExit: () => void;
}

// FIX: Cast import.meta to any to access env properties without vite/client types, resolving a TypeScript error.
const API_URL = (import.meta as any).env.VITE_API_URL;

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
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
            alert("Could not connect to the server to fetch admin data.");
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
            alert('Assets updated!');
        } catch (error) {
            console.error(error);
            alert('Error saving assets.');
        }
    };

    const resetAssets = async () => {
       try {
            const response = await fetch(`${API_URL}/api/assets/reset`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to reset assets');
            const defaultAssets = await response.json();
            setLocalAssets(defaultAssets);
            setAssets(defaultAssets);
            alert('Assets reset to default!');
        } catch (error) {
            console.error(error);
            alert('Error resetting assets.');
        }
    };
    
    const grantReward = async (userId: string) => {
        const amountStr = prompt(`Enter amount of Play Money to grant to user ${userId}:`);
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
                    alert(`Granted ${amount} Play Money to user ${userId}.`);
                } catch (error) {
                     console.error(error);
                     alert('Error granting reward.');
                }
            } else {
                alert('Invalid amount.');
            }
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-900/50 z-20">
                <button onClick={onExit} className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <ExitIcon className="w-6 h-6" />
                    <span>Lobby</span>
                </button>
                <h1 className="text-xl font-bold text-cyan-400">Admin Panel</h1>
                <div className="w-24"></div>
            </div>

            <div className="max-w-7xl mx-auto pt-20 space-y-8">
                {isLoading ? (
                    <div className="text-center">
                        <p className="text-lg">Loading Admin Data...</p>
                    </div>
                ) : (
                <>
                {/* Player Management */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-white">Player Management</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700/50 text-xs text-gray-300 uppercase tracking-wider">
                                <tr>
                                    <th className="p-3">Player</th>
                                    <th className="p-3">Play Money</th>
                                    <th className="p-3">Real Money (ETH)</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-700/50">
                                        <td className="p-3 font-semibold">{user.name}</td>
                                        <td className="p-3 font-mono">${user.playMoney.toLocaleString()}</td>
                                        <td className="p-3 font-mono">{user.realMoney.toFixed(4)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => grantReward(user.id)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-3 py-1 rounded-md text-sm">
                                                Grant Reward
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Asset Customization */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-white">Asset Customization</h2>
                    <p className="text-sm text-gray-400 mb-6">Change the visual assets used in the game. Use `{'{rank}'}` and `{'{suit}'}` placeholders for card faces.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Card Back URL</label>
                            <input type="text" name="cardBackUrl" value={localAssets.cardBackUrl} onChange={handleAssetChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Card Face URL Pattern</label>
                            <input type="text" name="cardFaceUrlPattern" value={localAssets.cardFaceUrlPattern} onChange={handleAssetChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Table Background URL</label>
                            <input type="text" name="tableBackgroundUrl" value={localAssets.tableBackgroundUrl} onChange={handleAssetChange} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>
                    </div>
                    <div className="flex space-x-4 mt-6">
                        <button onClick={saveAssets} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-md">Save Changes</button>
                        <button onClick={resetAssets} className="bg-gray-600 hover:bg-gray-500 text-white font-bold px-6 py-2 rounded-md">Reset to Default</button>
                    </div>
                </div>
                </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;