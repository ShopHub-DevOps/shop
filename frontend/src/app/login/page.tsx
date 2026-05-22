'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await login({ email: username, password });
    useAuthStore.getState().login(res.accessToken);
    window.location.href = '/admin/articles';
  } catch (err) {
    setError('Invalid credentials or server error.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-black">Admin Login</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold mb-1 text-slate-900">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-slate-900">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-black font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 mt-2 transition"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}