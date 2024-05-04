'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/dialog';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { useCart } from '@assets/hooks/useCart';
import { useRouter } from 'next/navigation';
import { FaSteam } from 'react-icons/fa';
import { Button } from '@ui/button';

const AuthorizeDialog = () => {
  const { isAuthorizeDialogOpen, closeAuthorizeDialog, authorizeDialogUrl } = useCart();
  const { user } = useCurrentUser();
  const router = useRouter();

  const url = authorizeDialogUrl || user?.basketAuthUrl;
  if (!url) return null;

  const onAuthorize = () => {
    closeAuthorizeDialog();
    router.push(url);
  };

  return (
    <Dialog open={isAuthorizeDialogOpen} onOpenChange={closeAuthorizeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Linking</DialogTitle>
          <DialogDescription>
            Please proceed by clicking &quot;Continue&quot; to connect your Steam account with your basket. This will
            ensure that we can accurately deliver your package following your purchase.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="flex-1" variant="ghost" onClick={closeAuthorizeDialog}>
            Close
          </Button>
          <Button className="flex flex-[2] items-center" onClick={onAuthorize}>
            Authorize <FaSteam className="ml-2 h-6 w-6" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorizeDialog;
