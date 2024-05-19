'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { errorToast } from '@assets/lib/utils';
import { PacmanLoader } from 'react-spinners';
import { useEffect, useState } from 'react';
import { ApplyType } from 'tebex_headless';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { toast } from 'sonner';

type TDiscounts = {
  giftcards: { card_number: string }[];
  coupons: { code: string }[];
  creator_code: string;
  refetch: () => void;
};
const Discounts = ({ coupons, creator_code, giftcards, refetch }: TDiscounts) => {
  const [creatorCode, setCreatorCode] = useState('');
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval>>();
  const [giftcard, setGiftcard] = useState('');
  const [coupon, setCoupon] = useState('');

  const discountsLen = coupons.length + (creator_code && creator_code.length >= 1 ? 1 : 0) + giftcards.length;
  useEffect(() => {
    clearInterval(intervalId);
    setIntervalId(undefined);
    toast.success('Discount calculated!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountsLen]);

  const { mutate: removeDiscount, isLoading: isRemoving } = trpc.userRouter.removeDiscount.useMutation();
  const { mutate: applyDiscount, isLoading: isApplying } = trpc.userRouter.applyDiscount.useMutation();

  const handleDiscountAdd = (method: ApplyType) => {
    const value = method === 'coupons' ? coupon : method === 'creator-codes' ? creatorCode : giftcard;
    if (value.length <= 1) return errorToast('The code is too short!');
    applyDiscount(
      {
        method,
        value,
      },
      {
        onSuccess: ({ error }) => {
          if (error) return errorToast('The code was not found!');
          toast.success('The code was successfully applied!');
          const interval = setInterval(refetch, 2_000);
          setIntervalId(interval);
        },
        onError: () => errorToast(),
      },
    );
  };
  const handleDiscountRemove = (method: ApplyType, value: string | number) => {
    value = value.toString();
    if (value.length <= 1) return errorToast('The code is too short!');
    removeDiscount(
      {
        method,
        value,
      },
      {
        onSuccess: ({ error }) => {
          if (error) return errorToast();
          toast.success('The code was successfully removed!');
          const interval = setInterval(refetch, 2_000);
          setIntervalId(interval);
        },
        onError: () => errorToast(),
      },
    );
  };

  const isLoading = isRemoving || isApplying;

  return (
    <div className="mt-4 space-y-4">
      <div className="max-w-lg">
        <Label htmlFor="giftcards">Gift Cards</Label>
        <div className="flex space-x-2">
          <Input
            id="giftcards"
            placeholder="Enter your giftcard..."
            onChange={(event) => setGiftcard(event.target.value)}
            value={giftcard}
            disabled={isLoading}
          />
          <Button onClick={() => handleDiscountAdd('giftcards')} disabled={isLoading}>
            Add
          </Button>
        </div>
        {giftcards.length >= 1 && (
          <div className="mt-1">
            <p>Active Codes</p>
            <div className="flex flex-col">
              {giftcards.map(({ card_number }, idx) => (
                <div key={`giftcard-${idx}`} className="flex space-x-2">
                  <Input value={card_number} disabled className="flex flex-[2]" />
                  <Button
                    variant="destructive"
                    className="flex flex-[1]"
                    disabled={isLoading}
                    onClick={() => handleDiscountRemove('giftcards', card_number)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="max-w-lg">
        <Label htmlFor="giftcards">Coupons</Label>
        <div className="flex space-x-2">
          <Input
            id="giftcards"
            placeholder="Enter your coupon..."
            onChange={(event) => setCoupon(event.target.value)}
            value={coupon}
            disabled={isLoading}
          />
          <Button onClick={() => handleDiscountAdd('coupons')} disabled={isLoading}>
            Add
          </Button>
        </div>
        {coupons.length >= 1 && (
          <div className="mt-1">
            <p>Active Codes</p>
            <div className="flex flex-col">
              {coupons.map(({ code }, idx) => (
                <div key={`coupon-${idx}`} className="flex space-x-2">
                  <Input value={code} disabled className="flex flex-[2]" />
                  <Button
                    variant="destructive"
                    className="flex flex-[1]"
                    disabled={isLoading}
                    onClick={() => handleDiscountRemove('coupons', code)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="max-w-lg">
        <Label htmlFor="giftcards">Creator Codes</Label>
        <div className="flex space-x-2">
          <Input
            id="giftcards"
            placeholder="Enter your creator code..."
            onChange={(event) => setCreatorCode(event.target.value)}
            value={creatorCode}
            disabled={isLoading}
          />
          <Button disabled={isLoading} onClick={() => handleDiscountAdd('creator-codes')}>
            Add
          </Button>
        </div>
        {creator_code && creator_code.length >= 1 && (
          <div className="mt-1">
            <p>Active Codes</p>
            <div className="flex flex-col">
              <div className="flex space-x-2">
                <Input value={creator_code} disabled className="flex flex-[2]" />
                <Button
                  variant="destructive"
                  className="flex flex-[1]"
                  disabled={isLoading}
                  onClick={() => handleDiscountRemove('creator-codes', creator_code)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!intervalId}>
        <DialogContent noCloseButton>
          <DialogHeader>
            <DialogTitle>Your discount is being calculated</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-x-4 space-y-4 md:flex-row md:space-y-0">
            <div className="md:w-[110px]">
              <PacmanLoader color="#3b82f6" />
            </div>

            <p className="text-sm md:w-[calc(100%-110px)]">
              We are currently calculating your discount. This process may take a moment. Please wait while we finalize
              the details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discounts;
