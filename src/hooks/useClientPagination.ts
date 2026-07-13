import { useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 10;

export const useClientPagination = <T,>(items: T[], pageSize = DEFAULT_PAGE_SIZE) => {
  const [requestedPage, setRequestedPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    setPage: setRequestedPage,
    totalPages,
    pageSize,
    totalItems: items.length,
    paginatedItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
