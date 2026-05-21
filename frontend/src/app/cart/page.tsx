'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Your cart is empty</h1>
        <Link href="/" className="text-blue-600 hover:underline font-medium">
          Go back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Product</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Quantity</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Price</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Total</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b last:border-b-0">
                <td className="p-4">
                  <span className="font-medium text-lg block">{item.name}</span>
                  <span className="text-sm text-gray-500">Max stock: {item.maxStock}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center border-2 rounded-full hover:bg-gray-50 disabled:opacity-30 transition"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-8 h-8 flex items-center justify-center border-2 rounded-full hover:bg-gray-50 disabled:opacity-30 transition"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right text-gray-600">${Number(item.price).toFixed(2)}</td>
                <td className="p-4 text-right font-semibold text-gray-800">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/*<div className="p-6 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-xl font-semibold text-gray-700">Running Total:</span>
          <span className="text-3xl font-bold text-gray-900">${getTotalPrice().toFixed(2)}</span>

        </div>*/}
        <div className="p-6 bg-slate-100 border-t-2 border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-slate-800">Running Total:</span>
            <span className="text-3xl font-black text-black">${getTotalPrice().toFixed(2)}</span>
          </div>
          <Link 
            href="/checkout"
            className="bg-blue-600 text-white font-extrabold px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow-md"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}