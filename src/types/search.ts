export interface SearchResultItem {
  entity_id: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  emails: string[];
  phones: string[];
}

export interface SearchEntityWrapper {
  entity: SearchResultItem;
  total_records_found: number;
  total_pages: number;
  page: number;
  page_size: number;
  cascade_depth_reached: number;
  execution_time_ms: number;
  was_limited: boolean;
  was_saturated: boolean;
}

export interface SearchResponse {
  entities: SearchEntityWrapper[];
  total_entities: number;
  message?: string;
  cost?: number;
  was_free?: boolean;
  free_requests_remaining?: number;
}
