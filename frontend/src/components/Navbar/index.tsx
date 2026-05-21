'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

const CartCounter = dynamic(() => import('./CartCounter'), { ssr: false });

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight hover:text-blue-700 transition">
          Shop
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/cart" className="relative flex items-center text-gray-700 hover:text-blue-600 transition">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <CartCounter />
          </Link>
          
          <Link href="/login" className="font-medium text-gray-700 hover:text-blue-600 transition">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}