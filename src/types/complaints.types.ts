export type ComplaintStatus = "pending" | "reviewed" | "resolved" | "rejected";

export type Complaint = {
  id: number;
  user_id: number;
  doc_id: string;
  field_name: string;
  message: string;
  status: ComplaintStatus;
  username: string;
  created_at: string;
  admin_comment: string;
  reviewed_at: string;
  admin_username: string;
  reviewed_by_admin_id: string;
  file_name?: string | null;
  file_group?: string | null;
  doc_summary?: {
    file_name?: string | null;
    file_group?: string | null;
  } | null;
};
