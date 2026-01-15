/**
 * Search History Persistence Utilities
 *
 * Stores and retrieves search history with frequency-based ranking.
 * - Last 5 searched terms are stored
 * - Ranked by frequency within the last week
 * - Most recent search is always first
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "search_history";
const MAX_HISTORY_ITEMS = 5;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface SearchHistoryEntry {
  term: string;
  timestamps: number[]; // Array of search timestamps
}

/**
 * Add a search term to history
 */
export async function addSearchTerm(term: string): Promise<void> {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return;

  try {
    const history = await getSearchHistoryRaw();
    const now = Date.now();
    const oneWeekAgo = now - ONE_WEEK_MS;

    // Find existing entry or create new one
    const existingIndex = history.findIndex((entry) => entry.term.toLowerCase() === normalizedTerm);

    if (existingIndex >= 0) {
      // Update existing entry - add new timestamp, filter old ones
      const entry = history[existingIndex];
      entry.timestamps = [...entry.timestamps.filter((t) => t > oneWeekAgo), now];
      // Move to front (most recent)
      history.splice(existingIndex, 1);
      history.unshift(entry);
    } else {
      // Add new entry at front
      history.unshift({ term: normalizedTerm, timestamps: [now] });
    }

    // Keep only MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error("Failed to add search term:", error);
  }
}

/**
 * Get search history ranked by frequency in last week
 * First item is always the most recent search
 */
export async function getSearchHistory(): Promise<string[]> {
  try {
    const history = await getSearchHistoryRaw();
    const oneWeekAgo = Date.now() - ONE_WEEK_MS;

    // Filter timestamps to last week and calculate ranking data
    const ranked = history
      .map((entry) => ({
        term: entry.term,
        recentTimestamps: entry.timestamps.filter((t) => t > oneWeekAgo),
        lastSearched: Math.max(...entry.timestamps, 0),
      }))
      .filter((entry) => entry.recentTimestamps.length > 0);

    // Sort by frequency (number of searches in last week)
    ranked.sort((a, b) => {
      // If frequencies are equal, sort by most recent
      if (b.recentTimestamps.length === a.recentTimestamps.length) {
        return b.lastSearched - a.lastSearched;
      }
      return b.recentTimestamps.length - a.recentTimestamps.length;
    });

    // Ensure most recent search is always first (requirement)
    if (ranked.length > 1) {
      const mostRecentIndex = ranked.findIndex(
        (entry) => entry.lastSearched === Math.max(...ranked.map((e) => e.lastSearched))
      );

      if (mostRecentIndex > 0) {
        const [mostRecent] = ranked.splice(mostRecentIndex, 1);
        ranked.unshift(mostRecent);
      }
    }

    return ranked.slice(0, MAX_HISTORY_ITEMS).map((entry) => entry.term);
  } catch (error) {
    console.error("Failed to get search history:", error);
    return [];
  }
}

/**
 * Clear all search history
 */
export async function clearSearchHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear search history:", error);
  }
}

/**
 * Internal: Get raw history data
 */
async function getSearchHistoryRaw(): Promise<SearchHistoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SearchHistoryEntry[];
  } catch {
    return [];
  }
}
