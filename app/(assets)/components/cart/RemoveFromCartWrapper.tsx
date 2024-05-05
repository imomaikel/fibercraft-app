'use client';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { cn, errorToast } from '@assets/lib/utils';
import { useCart } from '@assets/hooks/useCart';
import { ImSpinner10 } from 'react-icons/im';
import { CartContext } from './Cart';
import { trpc } from '@trpc/index';
import { useContext } from 'react';
import { toast } from 'sonner';

type TRemoveFromCartWrapper = {
  children: React.ReactNode;
  className?: string;
  itemId: number;
  itemName: string;
  disabled?: boolean;
};
const RemoveFromCartWrapper = ({ itemId, itemName, children, className, disabled }: TRemoveFromCartWrapper) => {
  const { setCartItemQuantity, openAuthorizeDialog } = useCart();
  const cartContext = useContext(CartContext);
  const { user } = useCurrentUser();

  const { mutate, isLoading } = trpc.userRouter.removeItem.useMutation();

  const onRemove = () => {
    if (user?.email) {
      cartContext.setLock(true);
      mutate(
        {
          itemId,
        },
        {
          onSuccess: (data) => {
            cartContext.setLock(false);
            if (data.status === 'error') {
              if (data.message === 'Basket not authorized') {
                openAuthorizeDialog(data.authUrl);
              } else {
                errorToast(data.message);
              }
            } else if (data.status === 'success') {
              toast.success(`Removed "${itemName}" from the basket!`);
              cartContext.updateCart(data.basket);
            }
          },
          onError: () => {
            cartContext.setLock(false);
            errorToast();
          },
        },
      );
    } else {
      setCartItemQuantity(itemId, itemName, 0);
    }
  };

  return (
    <div
      aria-label="Remove from the cart"
      role="button"
      onClick={() => !isLoading && onRemove()}
      className={cn('relative cursor-pointer', isLoading && 'cursor-default', className)}
    >
      {children}
      <div
        className={cn(
          'absolute inset-0 hidden h-full w-full items-center justify-center bg-black/50',
          disabled && 'pointer-events-none',
          isLoading && 'flex',
        )}
      >
        <ImSpinner10 className="h-6 w-6 animate-spin" />
      </div>
    </div>
  );
};

export default RemoveFromCartWrapper;
