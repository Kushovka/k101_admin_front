import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { SearchContextValue } from "../../../types/searchContext.types";

import type {
  SearchResultItem,
  SearchForm,
  SearchResponse,
} from "../../../types/search";

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [form, setForm] = useState<SearchForm>({
    name: "",
    phone: "",
    person_id: "",
    email: "",
    age: "",
  });

  const [result, setResult] = useState<SearchResultItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [res, setRes] = useState<SearchResponse | null>(null);

  const value: SearchContextValue = {
    form,
    setForm,
    result,
    setResult,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    res,
    setRes,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextValue => {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
