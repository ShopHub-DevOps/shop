'use client';

import { useEffect, useState } from 'react';
import { getOrders, Order, OrderStatus } from '@/lib/api/orders';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal - details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders(page, 10, statusFilter, dateFrom, dateTo);
      setOrders(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayFetch = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(delayFetch);
  }, [statusFilter, dateFrom, dateTo, page]); //dependencies

  const calculateTotal = (order: Order) => {
    return order.items.reduce((sum, item) => sum + (Number(item.priceAtPurchase) * item.quantity), 0);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.CONFIRMED: return 'bg-emerald-200 text-emerald-900 border-emerald-400';
      case OrderStatus.PENDING: return 'bg-amber-200 text-amber-900 border-amber-400';
      case OrderStatus.FAILED: return 'bg-red-200 text-red-900 border-red-400';
      default: return 'bg-slate-200 text-slate-900 border-slate-400';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl mt-8 text-slate-900">
      <h1 className="text-3xl font-extrabold mb-8 text-black">Manage Orders</h1>

      <div className="bg-slate-100 p-4 rounded-lg border-2 border-slate-300 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-900">Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border-2 border-slate-400 p-2 rounded text-black font-semibold min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.CONFIRMED}>Confirmed</option>
            <option value={OrderStatus.FAILED}>Failed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-900">Date From</label>
          <input 
            type="date" 
            value={dateFrom} 
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="border-2 border-slate-400 p-2 rounded text-black font-semibold"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-900">Date To</label>
          <input 
            type="date" 
            value={dateTo} 
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="border-2 border-slate-400 p-2 rounded text-black font-semibold"
          />
        </div>
        <button 
          onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
          className="ml-auto bg-slate-800 text-white font-bold px-4 py-2 rounded hover:bg-black transition"
        >
          Clear Filters
        </button>
      </div>

      <div className="bg-white rounded-lg border-2 border-slate-300 overflow-hidden shadow-md">
        <table className="w-full text-left">
          <thead className="bg-slate-200 border-b-2 border-slate-300">
            <tr>
              <th className="p-4 font-bold text-slate-900">Order ID</th>
              <th className="p-4 font-bold text-slate-900">Date</th>
              <th className="p-4 font-bold text-slate-900">Status</th>
              <th className="p-4 font-bold text-slate-900">Total</th>
              <th className="p-4 font-bold text-slate-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center font-bold text-xl text-slate-800">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center font-bold text-xl text-slate-800">No orders found.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b-2 border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-black">#{order.id}</td>
                  <td className="p-4 font-semibold text-slate-800">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-extrabold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-black">
                    ${calculateTotal(order).toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-800 transition"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && orders.length > 0 && (
        <div className="flex justify-center items-center gap-6 mt-8 mb-8">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-6 py-2 border-2 border-slate-800 text-slate-900 font-extrabold rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-900 transition"
          >
            Previous
          </button>
          <span className="font-extrabold text-black text-lg">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 border-2 border-slate-800 text-slate-900 font-extrabold rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-900 transition"
          >
            Next
          </button>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl border-4 border-slate-800 shadow-2xl">
            <div className="flex justify-between items-start mb-6 border-b-2 border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-black">Order #{selectedOrder.id}</h2>
                <p className="text-slate-800 font-semibold mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-slate-800 hover:text-black font-extrabold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <p className="font-semibold text-slate-900">
                <span className="font-extrabold text-black mr-2">Wallet:</span> 
                {selectedOrder.walletAddress ? (
                  <span className="font-mono bg-slate-100 p-1 border border-slate-300 rounded">{selectedOrder.walletAddress}</span>
                ) : 'N/A'}
              </p>
              <p className="font-semibold text-slate-900">
                <span className="font-extrabold text-black mr-2">TX Hash:</span> 
                {selectedOrder.txHash ? (
                  <span className="font-mono bg-slate-100 p-1 border border-slate-300 rounded break-all">{selectedOrder.txHash}</span>
                ) : 'N/A'}
              </p>
            </div>

            <h3 className="text-xl font-extrabold text-black mb-3">Order Items</h3>
            <div className="bg-slate-100 border-2 border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-300 border-b-2 border-slate-400">
                  <tr>
                    <th className="p-3 font-bold text-black">Article</th>
                    <th className="p-3 font-bold text-black text-center">Qty</th>
                    <th className="p-3 font-bold text-black text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-300">
                      <td className="p-3 font-bold text-slate-900">{item.articleName}</td>
                      <td className="p-3 font-bold text-slate-900 text-center">{item.quantity}</td>
                      <td className="p-3 font-extrabold text-black text-right">${Number(item.priceAtPurchase).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-200">
                    <td colSpan={2} className="p-3 text-right font-extrabold text-black text-lg">TOTAL:</td>
                    <td className="p-3 font-extrabold text-black text-xl text-right">${calculateTotal(selectedOrder).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}