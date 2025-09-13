import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PurchasedItem } from '../services/purchaseService';

interface CartState {
  items: PurchasedItem[];
  totalPrice: number;
  
  // 액션
  addItems: (items: PurchasedItem[]) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  updateTotalPrice: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      
      addItems: (newItems: PurchasedItem[]) => {
        set((state) => {
          const existingIds = new Set(state.items.map(item => item.id));
          const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
          const updatedItems = [...state.items, ...uniqueNewItems];
          
          return {
            items: updatedItems,
            totalPrice: updatedItems.reduce((sum, item) => sum + item.price, 0)
          };
        });
      },
      
      removeItem: (itemId: number) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.id !== itemId);
          return {
            items: updatedItems,
            totalPrice: updatedItems.reduce((sum, item) => sum + item.price, 0)
          };
        });
      },
      
      clearCart: () => {
        set({
          items: [],
          totalPrice: 0
        });
      },
      
      updateTotalPrice: () => {
        set((state) => ({
          totalPrice: state.items.reduce((sum, item) => sum + item.price, 0)
        }));
      }
    }),
    {
      name: 'cart-store',
    }
  )
);
