'use client';

import { useEffect, useState } from 'react';
import { getArticles, createArticle, updateArticle, deleteArticle, Article } from '@/lib/api/articles';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: '', price: 0, quantity: 0 });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles(page, 10, search);
      setArticles(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArticles();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const confirmDelete = async () => {
    if (articleToDelete === null) return;
    try {
      await deleteArticle(articleToDelete);
      setArticleToDelete(null);
      fetchArticles();
    } catch (error) {
      console.error(error);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, quantity: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setEditingId(article.id);
    setFormData({ name: article.name, price: Number(article.price), quantity: article.quantity });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateArticle(editingId, formData);
      } else {
        await createArticle(formData);
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-black">Manage Articles</h1>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add New Article
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 rounded w-full max-w-md text-black font-semibold placeholder:text-slate-700"
        />
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-slate-900">ID</th>
              <th className="p-4 font-bold text-slate-900">Name</th>
              <th className="p-4 font-bold text-slate-900">Price</th>
              <th className="p-4 font-bold text-slate-900">Stock</th>
              <th className="p-4 font-bold text-slate-900 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center font-bold text-xl text-slate-800">Loading...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center font-bold text-xl text-slate-800">No articles found.</td></tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="border-b-2 border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-black">{article.id}</td>
                  <td className="p-4 font-semibold text-slate-800">{article.name}</td>
                  <td className="p-4 font-extrabold text-black">${Number(article.price).toFixed(2)}</td>
                  <td className="p-4 font-extrabold text-black">{article.quantity}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(article)} className="text-blue-600 hover:underline mr-4">
                      Edit
                    </button>
                    <button onClick={() => setArticleToDelete(article.id)} className="text-red-600 hover:underline font-bold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-6 mt-6 mb-8">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-6 py-2 border-2 border-slate-800 text-slate-900 font-extrabold rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-900 transition">
          Previous
        </button>
        <span className="font-extrabold text-black text-lg">Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-6 py-2 border-2 border-slate-800 text-slate-900 font-extrabold rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-900 transition">
          Next
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-extrabold text-black mb-4">{editingId ? 'Edit Article' : 'New Article'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-900">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border p-2 rounded text-black font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-900">Price</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full border p-2 rounded text-black font-semibold"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-900">Stock Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full border p-2 rounded text-black font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-slate-900 hover:bg-slate-200 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {articleToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm border border-slate-300 shadow-2xl">
            <h2 className="text-2xl font-extrabold text-black mb-4">Confirm Delete</h2>
            <p className="text-slate-800 font-semibold mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setArticleToDelete(null)} 
                className="px-4 py-2 font-bold text-slate-900 hover:bg-slate-200 rounded transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}