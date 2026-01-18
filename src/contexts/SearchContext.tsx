import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  /** When true, search only shows results from user's library */
  libraryOnly: boolean;
  setLibraryOnly: (value: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryOnly, setLibraryOnly] = useState(false);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setLibraryOnly(false);
  }, []);

  return (
    <SearchContext.Provider
      value={{ searchQuery, setSearchQuery, clearSearch, libraryOnly, setLibraryOnly }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}
