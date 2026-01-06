import type { Dispatch, SetStateAction } from "react";
import type { SearchForm, SearchResultItem, SearchResponse } from "./search";

export interface SearchContextValue {
  form: SearchForm;
  setForm: Dispatch<SetStateAction<SearchForm>>;

  result: SearchResultItem[];
  setResult: Dispatch<SetStateAction<SearchResultItem[]>>;

  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;

  totalPages: number;
  setTotalPages: Dispatch<SetStateAction<number>>;

  res: SearchResponse | null;
  setRes: Dispatch<SetStateAction<SearchResponse | null>>;
}
