export type Appeal = {
  id: number;
  web_user_id: number | null;
  username?: string;
  telegram_username?: string;
  subject: string;
  message: string;
  category: string;
  category_label?: string;
  source: "web" | "telegram";
  status: "new" | "in_progress" | "closed";
  admin_reply?: string;
  created_at: string;
  reviewed_at?: string;
};

export type AppealsResponse = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: Appeal[];
};
