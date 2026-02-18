export type FileItem = {
  id: string;
  display_name: string;
  file_name?: string;
  file_description?: string | null;
  file_size?: number;
  created_at?: string;
  file_group: string;
  invalid_rows?: number;
  total_rows?: number;
  valid_rows?: number;
  s3_key?: string;
  s3_bucket?: string;
  updated_at?: string;
  processing_completed_at?: string;
  processing_started_at?: string;
  upload_date?: string;
  extracted_entities?: number;
  file_type?: string;

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

export type GlobalPauseStatus = {
  is_paused: boolean;
  paused_by: string | null;
  paused_at: string | null;
  globally_paused_count: number;
  manually_paused_count: number;
  queued_count: number;
  processing_count: number;
};

export type PauseAllResponse = {
  success: boolean;
  paused_by: string;
  paused_processing: number;
  paused_queued: number;
  revoked_celery_tasks: number;
  total_paused: number;
  message: string;
};

export type ResumeAllResponse = {
  success: boolean;
  resumed_count: number;
  failed_count: number;
  skipped_manual: number;
  message: string;
};

export type DatasetUploadPayload = {
  dataset_name: string;
  description?: string;
  linking_column?: string;
  files: File[];
};

export type DatasetUploadResponse = {
  status: string;
  dataset_id: string;
  dataset_name: string;
  files: any[];
  message: string;
  linking_column: string;
  detected_linking_column: string;
  name: string;
};

export type DatasetItem = {
  id: string;
  dataset_name: string;
  description: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  total_files: number;
  merged_entities_count: number;
  unique_linking_ids: number;
  linking_column_name: string | null;
  linking_column_confirmed: boolean;
  created_at: string;
};
