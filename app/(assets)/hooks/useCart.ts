import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';

type TCart = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  isAuthorizeDialogOpen: boolean;
  authorizeDialogUrl: string | null;
  openAuthorizeDialog: (url?: string) => void;
  closeAuthorizeDialog: () => void;

  cartItemsData: { [key: number]: number };
  addCartItem: (id: number, quantity: number) => void;
  removeCartItem: (id: number) => void;
  setCartItemQuantity: (id: number, quantity: number) => void;
};

const useCartStorage = create<TCart>()(
  persist(
    (set, get) => ({
      isCartOpen: false,
      closeCart: () => set({ isCartOpen: false }),
      openCart: () => set({ isCartOpen: true }),

      isAuthorizeDialogOpen: false,
      authorizeDialogUrl: null,
      openAuthorizeDialog: (url) => set({ isAuthorizeDialogOpen: true, authorizeDialogUrl: url || null }),
      closeAuthorizeDialog: () => set({ isAuthorizeDialogOpen: false }),

      cartItemsData: {},
      addCartItem: (id) => {
        const data = get().cartItemsData;
        const item = data[id];
        if (item !== undefined) {
          data[id] = data[id] + 1;
          set({ cartItemsData: data });
        } else {
          data[id] = 1;
          set({ cartItemsData: data });
        }
      },
      removeCartItem: (id) => {
        const data = get().cartItemsData;
        const item = data[id];
        if (item !== undefined) {
          if (item === 1) {
            delete data[id];
          } else {
            data[id] = data[id] - 1;
          }
        }
        set({ cartItemsData: data });
      },
      setCartItemQuantity: (id, quantity) => {
        const data = get().cartItemsData;
        data[id] = quantity;
        set({ cartItemsData: data });
      },
    }),
    {
      name: 'fibercraft-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useCart = () => {
  const {
    cartItemsData,
    closeCart,
    isCartOpen,
    openCart,
    addCartItem,
    removeCartItem,
    setCartItemQuantity,
    isAuthorizeDialogOpen,
    openAuthorizeDialog,
    closeAuthorizeDialog,
    authorizeDialogUrl,
  } = useCartStorage();

  return {
    openCart,
    closeCart,
    isCartOpen,

    cartItemsData,
    addCartItem,
    removeCartItem,
    setCartItemQuantity,

    isAuthorizeDialogOpen,
    authorizeDialogUrl,
    openAuthorizeDialog,
    closeAuthorizeDialog,
  };
};
