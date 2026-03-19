export interface SystemStatisticsResponse {
  gateway_status: string;

  users: {
    total: number;
    active: number;
    blocked: number;
    new_last_24h: number;
    new_last_7d: number;
    new_last_30d: number;
  };

  requests: {
    total: number;
    successful: number;
    failed: number;
    last_24h: number;
    last_7d: number;
    last_30d: number;
    by_type: Record<string, number>; // 🔥 ВАЖНО (у тебя его не было)
  };

  financial: {
    total_user_balance: string;
    average_user_balance: number; // 👈 у тебя было string, но приходит number
    total_spent: string;
    payments: {
      total_payments: number;
      total_amount: string;
      completed_amount: string;
      by_status: {
        pending: number;
        completed?: number; // иногда может не прийти
      };
    };
  };

  registration_requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };

  files: {
    total_files_uploaded: number;
    total_records_parsed: number;
    files_processing: number;
    files_completed: number;
    files_failed: number;
  };

  opensearch: {
    size_bytes: number;
    size_human: string;
  };
}
