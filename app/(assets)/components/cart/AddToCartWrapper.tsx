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

type TAddToCartWrapper = {
  children: React.ReactNode;
  className?: string;
  itemId: number;
  itemName: string;
  quantity?: number;
  disabled?: boolean;
  disabledQuantity?: boolean;
};
const AddToCartWrapper = ({
  itemId,
  itemName,
  quantity = 1,
  children,
  className,
  disabled,
  disabledQuantity,
}: TAddToCartWrapper) => {
  const { addCartItem, openAuthorizeDialog } = useCart();
  const cartContext = useContext(CartContext);
  const { user } = useCurrentUser();
  const pathname = usePathname();

  const { mutate, isLoading } = trpc.userRouter.addItem.useMutation();

  const onAdd = () => {
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
            cartContext.setLock(false);
            if (data.status === 'error') {
              if (data.message === 'Basket not authorized') {
                openAuthorizeDialog(data.authUrl);
              } else {
                errorToast(data.message);
              }
            } else if (data.status === 'success') {
              toast.success(`Added "${itemName}" to the basket!`);
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
      addCartItem(itemId, itemName, quantity, disabledQuantity);
    }
  };

  return (
    <div
      aria-label="Add to the cart"
      role="button"
      onClick={() => !isLoading && onAdd()}
      className={cn(
        'relative cursor-pointer',
        isLoading && 'cursor-default',
        disabled && 'pointer-events-none',
        className,
      )}
    >
      {children}
      <div className={cn('absolute inset-0 hidden h-full w-full items-center justify-center', isLoading && 'flex')}>
        <ImSpinner10 className="h-6 w-6 animate-spin" />
      </div>
    </div>
  );
};

export default AddToCartWrapper;
