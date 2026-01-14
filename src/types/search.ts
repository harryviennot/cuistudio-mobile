/**
 * Search types and interfaces
 */

export type DifficultyFilter = "easy" | "medium" | "hard";
export type SortOption = "relevance" | "recent" | "rating" | "cook_count" | "time";
export type TimeFilter = "quick" | "medium" | "long";

export interface SearchFilters {
  difficulty?: DifficultyFilter;
  categorySlug?: string;
  timeFilter?: TimeFilter;
}

export interface SearchSort {
  sortBy: SortOption;
}

export interface SearchState {
  query: string;
  filters: SearchFilters;
  sort: SearchSort;
}

/**
 * Time filter ranges mapping
 * - quick: Under 30 minutes
 * - medium: 30-60 minutes
 * - long: Over 60 minutes
 */
export const TIME_FILTER_RANGES: Record<TimeFilter, { min?: number; max?: number }> = {
  quick: { max: 30 },
  medium: { min: 30, max: 60 },
  long: { min: 60 },
};

/**
 * Sort option labels for UI display
 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  relevance: "search.sort.relevance",
  recent: "search.sort.recent",
  rating: "search.sort.rating",
  cook_count: "search.sort.cookCount",
  time: "search.sort.time",
};

/**
 * Time filter labels for UI display
 */
export const TIME_FILTER_LABELS: Record<TimeFilter, string> = {
  quick: "search.filters.time.quick",
  medium: "search.filters.time.medium",
  long: "search.filters.time.long",
};
