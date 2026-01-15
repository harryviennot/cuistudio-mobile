import { useState, useCallback, useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { recipeService } from "@/api/services";
import type { Recipe } from "@/types/recipe";
import type { SearchFilters, SearchSort } from "@/types/search";

interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialSort?: SearchSort;
  /** When true, only search user's library (no public results) with pagination */
  libraryOnly?: boolean;
}

const PAGE_SIZE = 20;

export function useSearch(options: UseSearchOptions = {}) {
  const { libraryOnly = false } = options;

  // State management
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [filters, setFilters] = useState<SearchFilters>(options.initialFilters ?? {});
  const [sort, setSort] = useState<SearchSort>(options.initialSort ?? { sortBy: "relevance" });

  const hasQuery = query.trim().length > 0;

  // Stabilize queryKey by extracting primitive values
  const stableFilterKey = useMemo(() => {
    return JSON.stringify({
      difficulty: filters.difficulty,
      categorySlugs: filters.categorySlugs,
      prepEnabled: filters.timeFilters?.prep?.enabled,
      prepMax: filters.timeFilters?.prep?.maxMinutes,
      cookEnabled: filters.timeFilters?.cook?.enabled,
      cookMax: filters.timeFilters?.cook?.maxMinutes,
      restEnabled: filters.timeFilters?.rest?.enabled,
      restMax: filters.timeFilters?.rest?.maxMinutes,
    });
  }, [filters]);

  const stableSortKey = sort.sortBy;

  // Library search query (user's own recipes)
  // When libraryOnly mode: use infinite query for pagination
  // When normal mode: use simple query (limited results shown in horizontal section)
  const libraryQuery = useQuery<Recipe[], Error>({
    queryKey: ["search", "library", query, stableFilterKey, stableSortKey],
    queryFn: () =>
      recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlugs: filters.categorySlugs,
        maxPrepTime: filters.timeFilters?.prep?.enabled
          ? filters.timeFilters.prep.maxMinutes
          : undefined,
        maxCookTime: filters.timeFilters?.cook?.enabled
          ? filters.timeFilters.cook.maxMinutes
          : undefined,
        maxRestTime: filters.timeFilters?.rest?.enabled
          ? filters.timeFilters.rest.maxMinutes
          : undefined,
        sortBy: sort.sortBy === "cook_count" ? "cook_count" : sort.sortBy,
        libraryOnly: true,
        limit: PAGE_SIZE,
      }),
    enabled: hasQuery && !libraryOnly, // Disabled when in libraryOnly mode (use infinite query instead)
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Library-only infinite query (for library search mode with pagination)
  const libraryInfiniteQuery = useInfiniteQuery<Recipe[], Error>({
    queryKey: ["search", "library-infinite", query, stableFilterKey, stableSortKey],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      return recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlugs: filters.categorySlugs,
        maxPrepTime: filters.timeFilters?.prep?.enabled
          ? filters.timeFilters.prep.maxMinutes
          : undefined,
        maxCookTime: filters.timeFilters?.cook?.enabled
          ? filters.timeFilters.cook.maxMinutes
          : undefined,
        maxRestTime: filters.timeFilters?.rest?.enabled
          ? filters.timeFilters.rest.maxMinutes
          : undefined,
        sortBy: sort.sortBy === "cook_count" ? "cook_count" : sort.sortBy,
        libraryOnly: true,
        limit: PAGE_SIZE,
        offset,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    enabled: hasQuery && libraryOnly, // Only enabled in libraryOnly mode
    staleTime: 2 * 60 * 1000,
  });

  // Public search query with infinite scroll (popular recipes)
  const publicQuery = useInfiniteQuery<Recipe[], Error>({
    queryKey: ["search", "public", query, stableFilterKey, stableSortKey],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      return recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlugs: filters.categorySlugs,
        maxPrepTime: filters.timeFilters?.prep?.enabled
          ? filters.timeFilters.prep.maxMinutes
          : undefined,
        maxCookTime: filters.timeFilters?.cook?.enabled
          ? filters.timeFilters.cook.maxMinutes
          : undefined,
        maxRestTime: filters.timeFilters?.rest?.enabled
          ? filters.timeFilters.rest.maxMinutes
          : undefined,
        sortBy: sort.sortBy === "cook_count" ? "rating" : sort.sortBy, // Use rating instead of cook_count for public
        libraryOnly: false,
        limit: PAGE_SIZE,
        offset,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    enabled: hasQuery && !libraryOnly, // Disabled in libraryOnly mode
    staleTime: 2 * 60 * 1000,
  });

  // Update functions
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const updateSort = useCallback((newSort: Partial<SearchSort>) => {
    setSort((prev) => ({ ...prev, ...newSort }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setFilters({});
    setSort({ sortBy: "relevance" });
  }, []);

  // Derived state - check for any active filters (new or legacy)
  const hasActiveFilters = useMemo(() => {
    const hasTimeFilters =
      filters.timeFilters?.prep?.enabled ||
      filters.timeFilters?.cook?.enabled ||
      filters.timeFilters?.rest?.enabled;

    const hasCategories =
      (filters.categorySlugs && filters.categorySlugs.length > 0) || !!filters.categorySlug;

    return !!(filters.difficulty || hasCategories || hasTimeFilters || filters.timeFilter);
  }, [filters]);

  // Determine loading/search states based on mode
  const isSearchingLibrary = libraryOnly ? libraryInfiniteQuery.isLoading : libraryQuery.isLoading;
  const isSearchingPublic = libraryOnly ? false : publicQuery.isLoading;
  const isSearching = isSearchingLibrary || isSearchingPublic;
  const hasSearched = libraryOnly
    ? libraryInfiniteQuery.isFetched
    : libraryQuery.isFetched || publicQuery.isFetched;
  const hasError = libraryOnly
    ? libraryInfiniteQuery.isError
    : libraryQuery.isError || publicQuery.isError;

  // Flatten paginated results
  const publicResults = useMemo(() => {
    return publicQuery.data?.pages.flat() ?? [];
  }, [publicQuery.data]);

  const libraryInfiniteResults = useMemo(() => {
    return libraryInfiniteQuery.data?.pages.flat() ?? [];
  }, [libraryInfiniteQuery.data]);

  return {
    // Query state
    query,
    setQuery,
    hasQuery,

    // Filter state
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,

    // Sort state
    sort,
    updateSort,

    // Results - in libraryOnly mode, libraryResults comes from infinite query
    libraryResults: libraryOnly ? libraryInfiniteResults : (libraryQuery.data ?? []),
    publicResults: libraryOnly ? [] : publicResults,

    // Loading states
    isSearchingLibrary,
    isSearchingPublic,
    isSearching,
    hasSearched,
    hasError,
    error: libraryOnly ? libraryInfiniteQuery.error : libraryQuery.error || publicQuery.error,

    // Pagination - in libraryOnly mode, use library pagination
    fetchNextPublicPage: libraryOnly
      ? libraryInfiniteQuery.fetchNextPage
      : publicQuery.fetchNextPage,
    hasNextPublicPage: libraryOnly ? libraryInfiniteQuery.hasNextPage : publicQuery.hasNextPage,
    isFetchingNextPublicPage: libraryOnly
      ? libraryInfiniteQuery.isFetchingNextPage
      : publicQuery.isFetchingNextPage,

    // Actions
    clearSearch,
    refetch: () => {
      if (libraryOnly) {
        libraryInfiniteQuery.refetch();
      } else {
        libraryQuery.refetch();
        publicQuery.refetch();
      }
    },
  };
}
