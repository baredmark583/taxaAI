import React, { useState } from 'react';

// FIX: Cast import.meta to any to access env properties without vite/client types, resolving a TypeScript error.
const API_URL = (import.meta as any).env.VITE_API_URL;

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          sessionStorage.setItem('isAdminAuthenticated', 'true');
          onLoginSuccess();
        }
      } else {
        const errData = await response.json();
        setError(errData.error || 'Неверный пароль.');
      }
    } catch (err) {
      setError('Не удалось подключиться к серверу. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Доступ для администратора</h1>
          <p className="text-gray-400">Crypto Poker Club</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Пароль администратора
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Проверка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;