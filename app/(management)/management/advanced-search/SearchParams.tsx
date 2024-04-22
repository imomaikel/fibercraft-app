'use client';
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const METHODS = ['Steam ID', 'Player ID', 'Discord ID', 'Character', 'Tribe'] as const;
type TMethod = (typeof METHODS)[number];

type TSearchParams = {
  onMethodChange: (method: TMethod) => void;
  onSearchParamsChange: (params: ReadonlyURLSearchParams) => void;
};
const SearchParams = ({ onMethodChange, onSearchParamsChange }: TSearchParams) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    onSearchParamsChange(searchParams);
    const param = searchParams.get('method');
    if (!param) return;

    const valid = METHODS.some((entry) => entry === param);
    if (!valid) return;

    onMethodChange(param as TMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
};

export default SearchParams;
