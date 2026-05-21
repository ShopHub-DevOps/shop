import { Article } from '@/lib/api/articles';

interface Props {
  article: Article;
  onSelect: (article: Article) => void;
}

export default function ArticleCard({ article, onSelect }: Props) {
  const inStock = article.quantity > 0;

  return (
    <div className="group relative border p-4 rounded-lg shadow bg-white hover:border-blue-300 transition-colors">
      <h3 className="font-semibold text-lg truncate">{article.name}</h3>
      <p className="text-gray-600 mt-2 font-medium">${Number(article.price).toFixed(2)}</p>
      
      <div className="mt-2 text-sm">
        {inStock ? (
          <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Stock: {article.quantity}</span>
        ) : (
          <span className="text-red-600 bg-red-50 px-2 py-1 rounded">Out of stock</span>
        )}
      </div>

      {inStock && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
          <button
            onClick={() => onSelect(article)}
            className="bg-blue-600 p-4 rounded-full shadow-lg text-white hover:bg-blue-700 hover:scale-110 transition-transform"
            title="Add to cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}