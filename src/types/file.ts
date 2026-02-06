export type FileItem = {
  id: string;
  display_name: string;
  file_name?: string;
  file_description?: string | null;
  file_size?: number;
  created_at?: string;
  file_group: string;

  uploaded_by_user_id?: string;
  processing_status?:
    | "queued"
    | "uploaded"
    | "pending"
    | "extracting"
    | "failed"
    | "extracted"
    | "reprocessing";
  progress_percent?: number;
  error_message?: string;
  priority?: number;
  position?: number;
};

export type FileItemQueue = {
  raw_file_id: string;
  file_name?: string;
  file_size?: number;
  status?:
    | "queued"
    | "paused"
    | "cancelled"
    | "failed"
    | "completed"
    | "processing";
  priority?: number;
  position?: number;
};

export type FilePriority = {
  priority: number;
};
export type FilePosition = {
  position: number;
};

export type ApiPriority = {
  success: boolean;
  file_id: string;
  priority?: number;
  position?: number;
  message: string;
};

export type FileGroup = {
  name: string;
  total: number;
};
