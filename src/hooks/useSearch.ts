import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { recipeService } from "@/api/services";
import type { Recipe } from "@/types/recipe";
import type { SearchFilters, SearchSort } from "@/types/search";
import { TIME_FILTER_RANGES } from "@/types/search";

interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialSort?: SearchSort;
}

export function useSearch(options: UseSearchOptions = {}) {
  // State management
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [filters, setFilters] = useState<SearchFilters>(options.initialFilters ?? {});
  const [sort, setSort] = useState<SearchSort>(options.initialSort ?? { sortBy: "relevance" });

  const hasQuery = query.trim().length > 0;

  // Convert time filters to min/max values
  // Supports both new granular timeFilters and legacy timeFilter
  const timeRange = useMemo(() => {
    // New granular time filters
    if (filters.timeFilters) {
      const { prep, cook, rest } = filters.timeFilters;
      let maxTime = 0;

      if (prep?.enabled && prep.maxMinutes > 0) maxTime += prep.maxMinutes;
      if (cook?.enabled && cook.maxMinutes > 0) maxTime += cook.maxMinutes;
      if (rest?.enabled && rest.maxMinutes > 0) maxTime += rest.maxMinutes;

      return maxTime > 0 ? { max: maxTime } : {};
    }

    // Legacy time filter (backward compatibility)
    if (filters.timeFilter) {
      return TIME_FILTER_RANGES[filters.timeFilter];
    }

    return {};
  }, [filters.timeFilters, filters.timeFilter]);

  // Handle category parameter (supports both single and multi-select)
  const categoryParam = useMemo(() => {
    // New multi-select categories
    if (filters.categorySlugs && filters.categorySlugs.length > 0) {
      return filters.categorySlugs.join(",");
    }
    // Legacy single category (backward compatibility)
    return filters.categorySlug;
  }, [filters.categorySlugs, filters.categorySlug]);

  // Library search query (user's own recipes)
  const libraryQuery = useQuery<Recipe[], Error>({
    queryKey: ["search", "library", query, filters, sort],
    queryFn: () =>
      recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlug: categoryParam,
        minTime: timeRange.min,
        maxTime: timeRange.max,
        sortBy: sort.sortBy === "cook_count" ? "cook_count" : sort.sortBy,
        libraryOnly: true,
        limit: 20,
      }),
    enabled: hasQuery,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Public search query (popular recipes)
  const publicQuery = useQuery<Recipe[], Error>({
    queryKey: ["search", "public", query, filters, sort],
    queryFn: () =>
      recipeService.searchRecipesFiltered(query, {
        difficulty: filters.difficulty,
        categorySlug: categoryParam,
        minTime: timeRange.min,
        maxTime: timeRange.max,
        sortBy: sort.sortBy === "cook_count" ? "rating" : sort.sortBy, // Use rating instead of cook_count for public
        libraryOnly: false,
        limit: 20,
      }),
    enabled: hasQuery,
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

  const isSearching = libraryQuery.isLoading || publicQuery.isLoading;
  const hasSearched = libraryQuery.isFetched || publicQuery.isFetched;
  const hasError = libraryQuery.isError || publicQuery.isError;

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

    // Results
    libraryResults: libraryQuery.data ?? [],
    publicResults: publicQuery.data ?? [],

    // Loading states
    isSearchingLibrary: libraryQuery.isLoading,
    isSearchingPublic: publicQuery.isLoading,
    isSearching,
    hasSearched,
    hasError,
    error: libraryQuery.error || publicQuery.error,

    // Actions
    clearSearch,
    refetch: () => {
      libraryQuery.refetch();
      publicQuery.refetch();
    },
  };
}
