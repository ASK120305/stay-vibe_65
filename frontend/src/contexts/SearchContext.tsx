import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  priceRange: [number, number];
  amenities: string[];
  rating: number | null;
}

interface SearchContextType {
  filters: SearchFilters;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  isSearching: boolean;
  setIsSearching: (loading: boolean) => void;
  searchHistory: SearchFilters[];
  addToHistory: (search: SearchFilters) => void;
}

const defaultFilters: SearchFilters = {
  location: "",
  checkIn: "",
  checkOut: "",
  guests: 2,
  priceRange: [0, 500],
  amenities: [],
  rating: null,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchFilters[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    try {
      const savedHistory = localStorage.getItem("searchHistory");
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  }, []);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const addToHistory = (search: SearchFilters) => {
    const newHistory = [search, ...searchHistory.slice(0, 4)]; // Keep only last 5 searches
    setSearchHistory(newHistory);
    try {
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  const value: SearchContextType = {
    filters,
    updateFilters,
    resetFilters,
    isSearching,
    setIsSearching,
    searchHistory,
    addToHistory,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};