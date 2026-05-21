import { useState } from 'react';
import { Article } from '@/lib/api/articles';
import { useCartStore } from '@/store/cartStore';

interface Props {
  article: Article | null;
  onClose: () => void;
}

export function AddToCartModal({ article, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  if (!article) return null;

  const handleAdd = () => {
    addToCart({
      id: article.id,
      name: article.name,
      price: Number(article.price),
      quantity,
      maxStock: article.quantity,
    });
  
    setQuantity(1); 
    onClose();
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%] shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{article.name}</h2>

          <button onClick={handleClose} className="text-gray-500 hover:text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-2xl text-gray-700 mb-6">${Number(article.price).toFixed(2)}</p>
        
        <div className="flex gap-4 items-center mb-6">
          <label className="font-medium text-gray-700">Quantity:</label>
          <input
            type="number"
            min="1"
            max={article.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border p-2 rounded w-24 text-center"
          />
          <span className="text-sm text-gray-500">Max: {article.quantity}</span>
        </div>

        <button
          onClick={handleAdd}
          disabled={quantity > article.quantity || quantity < 1}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          Confirm Add to Cart
        </button>
      </div>
    </div>
  );
}