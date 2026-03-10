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
  entity: SearchResultItem;
  total_records_found: number;
  total_pages: number;
  page: number;
  page_size: number;
}

export type CreateComplaintPayload = {
  doc_id: string;
  field_name: string;
  message: string;
};
