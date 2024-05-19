'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import ItemWrapper from '../../components/ItemWrapper';
import { MdPersonRemoveAlt1 } from 'react-icons/md';
import { cn, errorToast } from '@assets/lib/utils';
import DatePicker from '@ui/date-picker';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { format } from 'date-fns';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

const StaffControl = () => {
  const [discordAvatar, setDiscordAvatar] = useState('');
  const [designation, setDesignation] = useState('');
  const [joinedAt, setJoinedAt] = useState<Date>();
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');

  const {
    data: staff,
    isLoading: isStaffLoading,
    refetch,
  } = trpc.publicRouter.getStaff.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const { mutate: addStaffMember, isLoading: isMemberAdding } = trpc.management.addStaffMember.useMutation();
  const { mutate: removeStaffMember, isLoading: isMemberRemoving } = trpc.management.removeStaffMember.useMutation();
  const { mutate: findAvatar, isLoading: avatarLoading } = trpc.management.findAvatar.useMutation();

  const handleAddStaffMember = () => {
    addStaffMember(
      {
        joinedAt: joinedAt || new Date(),
        designation,
        name,
        image: avatar,
      },
      {
        onSuccess: ({ error, success }) => {
          if (error) return errorToast('Failed to add a new member.');
          if (success) {
            toast.success('Added a new member!');
            setDiscordAvatar('');
            setDesignation('');
            setJoinedAt(undefined);
            setAvatar('');
            setName('');
            refetch();
          }
        },
        onError: () => errorToast(),
      },
    );
  };
  const handleRemoveStaffMember = (id: number) => {
    removeStaffMember(
      {
        id,
      },
      {
        onSuccess: ({ error, success }) => {
          if (error) return errorToast('Failed to remove this member.');
          if (success) {
            toast.success('Removed member');
            refetch();
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  const handleFindAvatar = () => {
    findAvatar(
      { username: discordAvatar },
      {
        onSuccess: ({ avatarUrl, success, error }) => {
          if (error) return errorToast('Failed to find the avatar!');
          if (success) {
            toast.success('Found the avatar!');
            setAvatar(avatarUrl);
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  if (isStaffLoading || !staff) return null;

  return (
    <ItemWrapper title="Staff Management">
      <Table className="max-w-xl">
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Joined at</TableHead>
            <TableHead>Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={`staff-${member.id}`}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={member.image || ''} alt="avatar" />
                    <AvatarFallback>
                      <Image src="/logo.webp" alt="member avatar" fill />
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              </TableCell>
              <TableCell>{member.designation}</TableCell>
              <TableCell>{format(member.joinedAt, 'dd-MM-RRRR')}</TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemoveStaffMember(member.id)}
                  disabled={isMemberRemoving}
                >
                  <MdPersonRemoveAlt1 className="h-6 w-6" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <p className="my-1 text-lg font-semibold">Add a new member</p>
        <div className="max-w-sm space-y-2">
          <div>
            <Label htmlFor="member-name">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} id="member-name" disabled={isMemberAdding} />
          </div>

          <div>
            <Label htmlFor="member-designation">Designation</Label>
            <Input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              id="member-designation"
              disabled={isMemberAdding}
            />
          </div>

          <div className="flex flex-col">
            <Label htmlFor="member-joined-at">Joined at</Label>
            <DatePicker date={joinedAt || null} onChange={setJoinedAt} disabled={isMemberAdding} />
          </div>

          <div>
            <Label htmlFor="member-avatar">Avatar</Label>
            <div className="relative flex items-center space-x-4">
              <Input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                id="member-avatar"
                disabled={avatarLoading || isMemberAdding}
              />
              <Avatar>
                <AvatarImage src={avatar.startsWith('https://cdn.discordapp.com') ? avatar : ''} alt="avatar" />
                <AvatarFallback>
                  <Image src="/logo.webp" alt="default avatar" fill />
                </AvatarFallback>
              </Avatar>
            </div>
            <div
              className={cn(
                avatar.startsWith('https://cdn.discordapp.com')
                  ? 'text-muted-foreground'
                  : 'font-medium text-destructive',
              )}
            >
              <p className="text-xs">The avatar URL has to start with</p>
              <p className="text-xs">https://cdn.discordapp.com</p>
            </div>
          </div>
          <div>
            <p className="text-sm">Get avatar by Discord username</p>
            <div className="flex space-x-4">
              <Input
                value={discordAvatar}
                disabled={avatarLoading}
                onChange={(e) => setDiscordAvatar(e.target.value)}
              />
              <Button variant="secondary" disabled={avatarLoading} onClick={handleFindAvatar}>
                Find
              </Button>
            </div>
          </div>
        </div>
        <Button className="mt-4 w-full max-w-sm" onClick={handleAddStaffMember}>
          Add
        </Button>
      </div>
    </ItemWrapper>
  );
};

export default StaffControl;
