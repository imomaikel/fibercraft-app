import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';
import { toast } from 'sonner';

type TCart = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  isAuthorizeDialogOpen: boolean;
  authorizeDialogUrl: string | null;
  openAuthorizeDialog: (url?: string) => void;
  closeAuthorizeDialog: () => void;

  cartItemsData: { [key: number]: number };
  addCartItem: (id: number, itemName: string, quantity: number, disabledQuantity?: boolean) => void;
  removeCartItem: (id: number, itemName: string) => void;
  setCartItemQuantity: (id: number, itemName: string, quantity: number, disabledQuantity?: boolean) => void;
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
      addCartItem: (id, itemName, quantity, disabledQuantity) => {
        const data = get().cartItemsData;
        const item = data[id];
        if (item !== undefined) {
          if (disabledQuantity && data[id] + quantity >= 1) {
            toast.error('Product quantity limit reached!');
            return;
          }
          data[id] = data[id] + quantity;
          set({ cartItemsData: data });
        } else {
          data[id] = 1;
          set({ cartItemsData: data });
        }
        toast.success(`Added "${itemName}" to the basket!`);
      },
      removeCartItem: (id, itemName) => {
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
        toast.success(`Removed "${itemName}" from the basket!`);
      },
      setCartItemQuantity: (id, itemName, quantity, disabledQuantity) => {
        const data = get().cartItemsData;
        if (disabledQuantity && quantity >= 1) {
          toast.error('Product quantity limit reached!');
          return;
        }

        data[id] = quantity;
        if (quantity <= 0) {
          delete data[id];
          toast.success(`Removed "${itemName}" from the basket!`);
        } else {
          toast.success(`Updated "${itemName}" quantity!`);
        }
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
