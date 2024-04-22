'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@ui/switch';
import { Label } from '@ui/label';
import { useEffect } from 'react';

type TProductFilters = {
  categoryList: { label: string; enabled: boolean }[];
  setCategoryList: (list: { label: string; enabled: boolean }[]) => void;
};
const ProductFilters = ({ categoryList, setCategoryList }: TProductFilters) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const updateState = () => {
    const params = new URLSearchParams(searchParams);
    const activeFilters = params.getAll('f');

    if (!activeFilters.length) {
      setCategoryList(
        categoryList.map((entry) => ({
          enabled: true,
          label: entry.label,
        })),
      );
      return;
    }

    setCategoryList(
      categoryList.map((entry) => ({
        label: entry.label,
        enabled: activeFilters.length === 0 ? true : activeFilters.includes(entry.label),
      })),
    );
  };

  const handleSwitch = (label: string, newState: boolean) => {
    const params = new URLSearchParams(searchParams);
    const active = params.getAll('f');

    if (active.includes(label)) {
      params.delete('f', label);
    } else {
      const toAppend = categoryList.filter(
        (entry) => entry.label !== label && !active.includes(entry.label) && !newState,
      );
      toAppend.forEach((entry) => {
        params.append('f', entry.label);
      });
      if (!active.includes(label) && newState) {
        params.append('f', label);
      }
    }

    const newActive = params.getAll('f');

    if (newActive.length === categoryList.length) {
      params.delete('f');
    } else if (newActive.length === 0) {
      params.delete('f');
      const toAppend = categoryList.filter((entry) => entry.label !== label);
      toAppend.forEach((entry) => {
        params.append('f', entry.label);
      });
    }

    router.replace(`${pathname}?${params}`);
  };

  useEffect(() => {
    updateState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="flex flex-wrap space-x-4">
      {categoryList.map((entry) => (
        <div className="flex items-center space-x-2" key={`filter-${entry.label}`}>
          <Label htmlFor={`${entry.label}-switch`}>{entry.label}</Label>
          <Switch
            id={`${entry.label}-switch`}
            checked={entry.enabled}
            onCheckedChange={(newState) => handleSwitch(entry.label, newState)}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductFilters;
