'use client';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { cn, errorToast } from '@assets/lib/utils';
import { useCart } from '@assets/hooks/useCart';
import { usePathname } from 'next/navigation';
import { ImSpinner10 } from 'react-icons/im';
import { CartContext } from './Cart';
import { useContext } from 'react';
import { trpc } from '@trpc/index';
import { toast } from 'sonner';

type TUpdateQuantityWrapper = {
  children: React.ReactNode;
  className?: string;
  itemId: number;
  itemName: string;
  quantity: number;
  disabled?: boolean;
  disabledQuantity?: boolean;
};
const UpdateQuantityWrapper = ({
  itemId,
  itemName,
  children,
  className,
  quantity,
  disabled,
  disabledQuantity,
}: TUpdateQuantityWrapper) => {
  const { setCartItemQuantity, openAuthorizeDialog } = useCart();
  const cartContext = useContext(CartContext);
  const { user } = useCurrentUser();
  const pathname = usePathname();

  const { mutate, isLoading } = trpc.userRouter.updateItem.useMutation();

  const onUpdate = () => {
    if (user?.email) {
      cartContext.setLock(true);
      mutate(
        {
          itemId,
          quantity,
          pathname,
        },
        {
          onSuccess: (data) => {
            if (data.status === 'error') {
              if (data.message === 'Basket not authorized') {
                openAuthorizeDialog(data.authUrl);
              } else {
                errorToast(data.message);
              }
            } else if (data.status === 'success') {
              if (quantity <= 0) {
                toast.success(`Removed "${itemName}" from the basket!`);
              } else {
                toast.success(`Updated "${itemName}" quantity!`);
              }
              cartContext.updateCart(data.basket);
            }
            cartContext.setLock(false);
          },
          onError: () => {
            cartContext.setLock(false);
            errorToast();
          },
        },
      );
    } else {
      setCartItemQuantity(itemId, itemName, quantity, disabledQuantity);
    }
  };

  return (
    <div
      aria-label="Update item quantity"
      role="button"
      onClick={() => !isLoading && onUpdate()}
      className={cn(
        'relative cursor-pointer',
        isLoading && 'cursor-default',
        disabled && 'pointer-events-none',
        className,
      )}
    >
      {children}
      <div
        className={cn(
          'absolute inset-0 hidden h-full w-full items-center justify-center bg-black/50',
          isLoading && 'flex',
        )}
      >
        <ImSpinner10 className="h-6 w-6 animate-spin" />
      </div>
    </div>
  );
};

export default UpdateQuantityWrapper;
