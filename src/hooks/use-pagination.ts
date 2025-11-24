import { useState, useMemo, useEffect } from "react";

export interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  searchQuery?: string;
  searchFields?: (keyof T)[];
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
  searchQuery = "",
  searchFields = [],
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === "number") {
          return value.toString().includes(query);
        }
        return false;
      })
    );
  }, [items, searchQuery, searchFields]);

  // Calculate pagination values
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Ensure current page is within bounds
  const safePage = Math.min(currentPage, totalPages);

  // Get current page items
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    // Current page data
    items: paginatedItems,
    currentPage: safePage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Pagination controls
    goToPage: handlePageChange,
    nextPage: () => handlePageChange(safePage + 1),
    previousPage: () => handlePageChange(safePage - 1),
    goToFirstPage: () => handlePageChange(1),
    goToLastPage: () => handlePageChange(totalPages),

    // State checks
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
    isFirstPage: safePage === 1,
    isLastPage: safePage === totalPages,
  };
}
