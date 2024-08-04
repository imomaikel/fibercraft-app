'use client';
import { managementRouter } from '@trpc/management-router';
import { inferRouterOutputs } from '@trpc/server';
import PollCard from './PollCard';
import React from 'react';

type TPollList = {
  isLoading: boolean;
  polls: undefined | inferRouterOutputs<typeof managementRouter>['getPolls'];
};
const PollList = ({ isLoading, polls }: TPollList) => {
  if (isLoading) return null;
  if (!polls) return null;

  return (
    <div className="customScroll flex gap-4 overflow-x-auto py-4">
      {polls.map((poll, idx) => (
        <PollCard key={`poll-${idx}`} {...poll} />
      ))}
    </div>
  );
};

export default PollList;
