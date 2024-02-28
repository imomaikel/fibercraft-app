import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';

type TUseMobileNavbar = {
  isMobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

export const useMobileNavbar = create<TUseMobileNavbar>()(
  persist(
    (set) => ({
      isMobileNavOpen: false,
      openMobileNav: () => set({ isMobileNavOpen: true }),
      closeMobileNav: () => set({ isMobileNavOpen: false }),
    }),
    {
      name: 'fibercraft-navbar',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
