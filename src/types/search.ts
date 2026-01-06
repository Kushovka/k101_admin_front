export interface SearchForm {
  name: string;
  phone: string;
  person_id: string;
  email: string;
  age: string;
}

export interface SearchResultItem {
  entity_id: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  emails: string[];
  phones: string[];
}

export interface SearchResponse {
  count: number;
  total_pages: number;
  results: SearchResultItem[];
}
