'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthLinks() {
  const router = useRouter();
  const { isLoggedIn, isAdmin, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-6 border-l pl-6 border-gray-200">
        {isAdmin() && (
          <Link href="/admin/articles" className="font-medium text-gray-700 hover:text-blue-600 transition">
            Admin Panel
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="font-medium text-red-500 hover:text-red-700 transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="border-l pl-6 border-gray-200">
      <Link href="/login" className="font-medium text-gray-700 hover:text-blue-600 transition">
        Login
      </Link>
    </div>
  );
}