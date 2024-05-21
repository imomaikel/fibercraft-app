'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { errorToast } from '@assets/lib/utils';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { toast } from 'sonner';

const CheckScore = () => {
  const [index, setIndex] = useState(0);
  const [tribeName, setTribeName] = useState('');

  const { mutate: checkTribeScore, isLoading, data: tribes } = trpc.publicRouter.checkTribeScore.useMutation();
  const tribesExist = tribes && tribes.length >= 1;

  const handleSearch = () => {
    if (tribeName.length <= 2) {
      return errorToast('The Tribe Name is too short!');
    }

    checkTribeScore(
      { tribeName },
      {
        onSuccess: (response) => {
          setIndex(0);
          if (response.length >= 1) {
            if (response.length === 1) {
              toast.success('Tribe found!');
            } else {
              toast.success(`Found ${response.length} tribes!`);
            }
          } else {
            errorToast('We could not find a tribe with that name!');
          }
        },
        onError: () => errorToast(),
      },
    );
  };

  return (
    <div className="mt-4 rounded-lg bg-muted/20 px-8 py-4">
      <h2 className="text-lg font-medium">Curious to know your tribe score?</h2>
      <div className="mt-2">
        <Label>Tribe Name</Label>
        <div className="flex items-center">
          <Input
            className="rounded-br-none rounded-tr-none"
            disabled={isLoading}
            value={tribeName}
            onChange={(event) => setTribeName(event.target.value)}
          />
          <Button className="rounded-bl-none rounded-tl-none" disabled={isLoading} onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>
      {tribesExist && (
        <div className="mt-4 flex flex-col">
          <Table className="overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead className="w-3/4">Tribe</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <motion.div key={`${tribes[index].tribeName}-name`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {tribes[index].tribeName}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    key={`${tribes[index].tribeName}-score`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {tribes[index].score.toLocaleString('de-DE')}
                  </motion.div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {tribes.length >= 2 && (
            <div className="mt-2 flex flex-col">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" disabled={index === 0} onClick={() => setIndex((prev) => prev - 1)} variant="outline">
                  Previous
                </Button>
                <Button
                  size="sm"
                  disabled={index + 1 === tribes.length}
                  onClick={() => setIndex((prev) => prev + 1)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Tribe <span>{index + 1}</span> of <span>{tribes.length}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckScore;
