export interface SystemStatisticsResponse {
  gateway_status: string;
  files: {
    files_completed: number;
    files_failed: number;
    files_processing: number;
    total_files_uploaded: number;
    total_files_parsed: number;
    total_records_parsed: number;
  };
  financial: {
    average_user_balance: string;
    total_spent: string;
    total_user_balance: string;
    payments: {
      completed_amount: string;
      total_amount: string;
      total_payments: number;
      by_status: {
        completed: number;
        pending: number;
      };
    };
  };
  registration_requests: {
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  };
  requests: {
    failed: number;
    last_7d: number;
    last_24h: number;
    last_30d: number;
    successful: number;
    total: number;
  };
  users: {
    active: number;
    blocked: number;
    email_verified: number;
    new_last_7d: number;
    new_last_24h: number;
    new_last_30d: number;
    total: number;
  };
  total_files_uploaded: number;
}
