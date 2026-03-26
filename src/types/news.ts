export type NewsItem = {
  id: number;
  title: string;
  content: string;
  category: string;
  category_label: string;
  status: string;
  status_label: string;
  pinned: boolean;
  scheduled_at: string | null;
  created_at: string;
  published_at: string | null;
};

export type NewsListResponse = {
  items: NewsItem[];
  total_pages: number;
};
