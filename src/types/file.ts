export type FileItem = {
  id: string;
  display_name: string;
  file_name?: string;
  file_description?: string | null;
  file_size?: number;
  created_at?: string;

  uploaded_by_user_id?: string;
  processing_status?:
    | "queued"
    | "uploaded"
    | "extracting"
    | "failed"
    | "extracted";
  progress_percent?: number;
  error_message?: string;
};
