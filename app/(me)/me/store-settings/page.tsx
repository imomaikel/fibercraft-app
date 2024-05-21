'use client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui/dialog';
import { CartContext } from '@assets/components/cart/Cart';
import { useContext, useEffect, useState } from 'react';
import { errorToast } from '@assets/lib/utils';
import { StoreMethod } from '@prisma/client';
import { SyncLoader } from 'react-spinners';
import { Button } from '@ui/button';
import { Switch } from '@ui/switch';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { toast } from 'sonner';

const MyStoreSettingsPage = () => {
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval>>();
  const [platform, setPlatform] = useState<StoreMethod>();
  const { refetch, cart } = useContext(CartContext);
  const [epicId, setEpicId] = useState('');

  const { data, isLoading } = trpc.userRouter.getMyStoreSettings.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess: (response) => {
      setPlatform(response.storeMethod);
      setEpicId(response.epicId || '');
    },
  });

  const { mutate: updateMyStoreSettings, isLoading: isUpdating } = trpc.userRouter.updateMyStoreSettings.useMutation();

  useEffect(() => {
    if (intervalId) {
      toast.success(`Settings Updated! Now, packages will be sent to your ${platform} account`);
    }
    clearInterval(intervalId);
    setIntervalId(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const handleUpdate = () => {
    updateMyStoreSettings(
      {
        data:
          platform === 'EPIC'
            ? {
                epicId,
                method: 'EPIC',
              }
            : {
                method: 'STEAM',
              },
      },
      {
        onSuccess: ({ error }) => {
          if (error) return errorToast();
          if (cart) {
            toast.info('Please wait...');
            const interval = setInterval(refetch, 2_000);
            setIntervalId(interval);
          } else {
            toast.success(`Settings Updated! Now, packages will be sent to your ${platform} account`);
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  const changeSwitch = () => {
    setPlatform(platform === 'EPIC' ? 'STEAM' : 'EPIC');
  };

  if (!data || isLoading) return null;

  return (
    <div>
      <h2 className="text-4xl font-bold">Your Store Settings</h2>
      <div className="mt-6">
        <div>
          <h3 className="text-2xl font-bold">Delivery Platform</h3>
          <p className="text-muted-foreground">Select what platform you are using</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Label>Steam</Label>
              <Switch onCheckedChange={changeSwitch} checked={platform === 'STEAM'} disabled={isUpdating} />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Epic Games</Label>
              <Switch onCheckedChange={changeSwitch} checked={platform === 'EPIC'} disabled={isUpdating} />
            </div>
          </div>
        </div>
        {platform === 'EPIC' && (
          <div className="mt-4">
            <Label>Epic ID</Label>
            <Input
              value={epicId}
              onChange={(event) => setEpicId(event.target.value)}
              className="max-w-xs"
              disabled={isUpdating}
            />
            <p className="text-sm text-muted-foreground">Required valid Epic ID account</p>
          </div>
        )}
        <div className="mt-6 max-w-sm">
          <p className="my-2 rounded-lg bg-destructive/50 p-2 font-medium">
            If you change the Delivery Platform, the current cart will be cleared.
          </p>
          <Button className="w-full" disabled={isUpdating} onClick={handleUpdate}>
            Update
          </Button>
        </div>
      </div>
      <Dialog open={!!intervalId}>
        <DialogContent noCloseButton>
          <DialogHeader>
            <DialogTitle>Please wait</DialogTitle>
            <DialogDescription>We are changing your game platform.</DialogDescription>
          </DialogHeader>
          <div>
            <SyncLoader color="#3b82f6" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyStoreSettingsPage;
