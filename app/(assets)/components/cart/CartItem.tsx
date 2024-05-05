'use client';
import { FaExternalLinkAlt, FaMinus, FaPlus } from 'react-icons/fa';
import RemoveFromCartWrapper from './RemoveFromCartWrapper';
import UpdateQuantityWrapper from './UpdateQuantityWrapper';
import { BasketPackage, Package } from 'tebex_headless';
import AddToCartWrapper from './AddToCartWrapper';
import { formatPrice } from '@assets/lib/utils';
import { BsCartXFill } from 'react-icons/bs';
import { Button } from '@ui/button';
import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type TCartItem = {
  item: Package & BasketPackage;
};
const CartItem = ({ item }: TCartItem) => {
  const {
    category: { name: categoryName, id: categoryId },
    disable_quantity,
    id,
    image,
    in_basket: { quantity, price },
    name,
    sales_tax,
    total_price,
  } = item;

  const quantityTotalPrice = useMemo(() => formatPrice(total_price * quantity), [total_price, quantity]);

  return (
    <div className="space-y-2 rounded-lg border p-2">
      <div className="relative flex space-x-2">
        <div className="relative flex max-h-[128px] max-w-[128px] shrink-0 items-center justify-center">
          <Image alt={name} src={image || '/fiber.webp'} className="h-auto w-auto" width={128} height={128} />
        </div>
        <div className="flex flex-1 flex-col">
          <div>
            <span className="line-clamp-1 text-center text-lg font-bold">{name}</span>
            <Link href={`/store/category/${categoryId}`}>
              <span className="line-clamp-1 text-center text-xs text-muted-foreground underline">{categoryName}</span>
            </Link>
          </div>
          <div className="flex items-center px-1 text-sm">
            <span>Price</span>
            <div className="mx-4 flex h-px flex-1 bg-primary" />
            <span>{formatPrice(price)}</span>
          </div>
          <div className="flex items-center px-1 text-sm">
            <span>Sales Tax</span>
            <div className="mx-4 flex h-px flex-1 bg-primary" />
            <span>{formatPrice(sales_tax)}</span>
          </div>
          <div className="flex items-center px-1 text-sm">
            <span>Quantity</span>
            <div className="mx-4 flex h-px flex-1 bg-primary" />
            <span>x{quantity}</span>
          </div>
          <div className="flex items-center px-1 text-sm">
            <span>Total</span>
            <div className="mx-4 flex h-px flex-1 bg-primary" />
            <span>{quantityTotalPrice}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <AddToCartWrapper itemId={id} itemName={name} disabled={disable_quantity} disabledQuantity={disable_quantity}>
          <Button disabled={disable_quantity} size="icon">
            <span className="sr-only">Add one piece</span>
            <FaPlus className="h-6 w-6" />
          </Button>
        </AddToCartWrapper>
        <UpdateQuantityWrapper
          itemId={id}
          itemName={name}
          quantity={quantity - 1}
          disabled={disable_quantity}
          disabledQuantity={disable_quantity}
        >
          <Button disabled={disable_quantity} size="icon">
            <span className="sr-only">Remove one piece</span>
            <FaMinus className="h-6 w-6" />
          </Button>
        </UpdateQuantityWrapper>
        <Button asChild className="flex-1">
          <Link href={`/store/${id}`}>
            Details <FaExternalLinkAlt className="ml-2 h-6 w-6" />
          </Link>
        </Button>
        <RemoveFromCartWrapper itemId={id} itemName={name}>
          <Button size="icon" variant="destructive">
            <span className="sr-only">Remove from the cart</span>
            <BsCartXFill className="h-6 w-6" />
          </Button>
        </RemoveFromCartWrapper>
      </div>
    </div>
  );
};

export default CartItem;
