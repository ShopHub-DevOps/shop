'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eip1193Provider, ethers } from 'ethers';
import { useCartStore } from '@/store/cartStore';
import { createCheckout } from '@/lib/api/orders';

declare global {
  interface Window {
    //ethereum?: any;
    ethereum?: Eip1193Provider & { isMetaMask?: boolean };
  }
}

const ETH_PRICE_USD = 3000; // Mock

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalUsd = getTotalPrice();
  const totalEth = (totalUsd / ETH_PRICE_USD).toFixed(4); //ETH

  const connectWallet = async () => {
    setError('');
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to proceed.');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setWalletAddress(accounts[0]);
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!walletAddress) return;

    if (!process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS) {
      setError('Shop wallet address is not configured in .env file!');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: process.env.NEXT_PUBLIC_SHOP_WALLET_ADDRESS,
        value: ethers.parseEther(totalEth),
      });

      await tx.wait();

      await createCheckout({
        walletAddress: walletAddress,
        txHash: tx.hash,
        items: items.map(i => ({ articleId: i.id, quantity: i.quantity }))
      });

      clearCart();
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        //cast to ethers approp
        const errorObj = err as { response?: { data?: { message?: string } }, message?: string };
        setError(errorObj.response?.data?.message || errorObj.message || 'Payment failed.');
      } else {
        setError('Payment failed.');
      } 
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-extrabold mb-4 text-slate-900">Checkout</h1>
        <p className="text-slate-800 font-semibold">Your cart is empty.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-blue-600 hover:text-blue-800 font-bold underline">
          Go back to shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-8">
      <h1 className="text-4xl font-extrabold mb-8 text-black text-center">Crypto Checkout</h1>

      {success ? (
        <div className="bg-emerald-100 border-4 border-emerald-500 p-8 rounded-lg text-center shadow-xl">
          <h2 className="text-3xl font-black text-emerald-900 mb-4">Payment Successful!</h2>
          <p className="text-emerald-800 font-bold text-lg">Your transaction has been verified on the blockchain.</p>
          <p className="text-emerald-800 font-semibold mt-2">Redirecting to shop...</p>
        </div>
      ) : (
        <div className="bg-slate-100 border-4 border-slate-800 rounded-xl p-8 shadow-2xl">
          <div className="mb-8 p-6 bg-white border-2 border-slate-300 rounded-lg">
            <h2 className="text-2xl font-extrabold text-black border-b-2 border-slate-200 pb-4 mb-4">Order Summary</h2>
            <div className="flex justify-between items-center text-xl font-bold text-slate-800 mb-2">
              <span>Total USD:</span>
              <span>${totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black text-black bg-slate-200 p-4 rounded mt-4">
              <span>To Pay (ETH):</span>
              <span>{totalEth} ETH</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-600 text-red-900 p-4 font-bold mb-6">
              {error}
            </div>
          )}

          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="w-full bg-slate-900 text-white text-xl font-extrabold py-4 rounded-lg hover:bg-black transition transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3"
            >
              Connect MetaMask
            </button>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                <p className="text-blue-900 font-bold mb-1">Connected Wallet:</p>
                <p className="font-mono text-sm break-all text-blue-800 font-semibold">{walletAddress}</p>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white text-xl font-extrabold py-4 rounded-lg hover:bg-blue-800 transition transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Processing Transaction...' : `Pay ${totalEth} ETH`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}