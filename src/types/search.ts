/**
 * Search types and interfaces
 */

export type DifficultyFilter = "easy" | "medium" | "hard";
export type SortOption = "relevance" | "recent" | "rating" | "cook_count" | "time";

/**
 * Granular time filter configuration for individual time types
 */
export interface TimeFilterConfig {
  enabled: boolean;
  maxMinutes: number;
}

/**
 * Time filters for prep, cook, and rest times
 */
export interface TimeFilters {
  prep?: TimeFilterConfig;
  cook?: TimeFilterConfig;
  rest?: TimeFilterConfig;
}

export interface SearchFilters {
  difficulty?: DifficultyFilter;
  categorySlugs?: string[]; // Multi-select categories (OR logic)
  timeFilters?: TimeFilters; // Granular time filters
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
 * Sort option labels for UI display
 */
export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  relevance: "search.sort.relevance",
  recent: "search.sort.recent",
  rating: "search.sort.rating",
  cook_count: "search.sort.cookCount",
  time: "search.sort.time",
};
