import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number; // user's desired 
  maxStock: number; // true stock quantity
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);

        if (existingItem) {

          const newQuantity = Math.min(
            existingItem.quantity + item.quantity, 
            existingItem.maxStock
          );
          
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: newQuantity } : i
            ),
          });
        } else {

          const validatedItem = { 
            ...item, 
            quantity: Math.min(item.quantity, item.maxStock) 
          };
          set({ items: [...currentItems, validatedItem] });
        }
      },

      removeFromCart: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map((i) => {
            if (i.id === id) {

              const validQuantity = Math.min(Math.max(1, quantity), i.maxStock);
              return { ...i, quantity: validQuantity };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'shop-cart-storage', // localStorage key
    }
  )
);