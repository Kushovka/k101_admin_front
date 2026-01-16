import type { Dispatch, SetStateAction } from "react";
import type { SearchForm, SearchResultItem, SearchResponse } from "./search";
import React from "react";

export interface SearchContextValue {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;

  result: SearchResultItem[];
  setResult: Dispatch<SetStateAction<SearchResultItem[]>>;

  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;

  totalPages: number;
  setTotalPages: Dispatch<SetStateAction<number>>;

  res: SearchResponse | null;
  setRes: Dispatch<SetStateAction<SearchResponse | null>>;
}
