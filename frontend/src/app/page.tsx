'use client';

import { useEffect, useState } from 'react';
import { getArticles, Article } from '@/lib/api/articles';
import ArticleCard from '@/components/ArticleCard';
import { AddToCartModal } from '@/components/AddToCartModal';

export default function ShopPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

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

  return (
    <div className="container mx-auto p-4 relative min-h-screen">
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border-2 border-gray-200 p-3 pl-10 rounded-lg w-full focus:outline-none focus:border-blue-500 transition-colors"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-lg">
          No articles match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onSelect={setSelectedArticle} 
              />
            ))}
          </div>

          <div className="flex justify-center items-center gap-6 mt-12 mb-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-6 py-2 border-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition"
            >
              Previous
            </button>
            <span className="font-medium text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2 border-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition"
            >
              Next
            </button>
          </div>
        </>
      )}

      <AddToCartModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
      />
    </div>
  );
}
