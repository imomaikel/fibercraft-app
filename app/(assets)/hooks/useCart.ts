import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';

type TCart = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

export const useCart = create<TCart>()(
  persist(
    (set) => ({
      isCartOpen: false,
      closeCart: () => set({ isCartOpen: false }),
      openCart: () => set({ isCartOpen: true }),
    }),
    {
      name: 'fibercraft-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
