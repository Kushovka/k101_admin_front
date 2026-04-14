export type UserRole = "user" | "admin";

export interface ApiUser {
  id: string;
  username: string;
  telegram_username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  registration_date: string;
  is_blocked: boolean;
  balance?: number;
  free_requests_count?: number;
  all_requests_count?: number;
  total_spent?: number;
  last_login?: string;
}

export interface TableUser {
  id: string;
  nickName: string;
  telegramUsername: string;
  name: string;
  surname: string;
  email: string;
  role: "User" | "Admin";
  registrationDate: string;
  status: "Blocked" | "Active";
  identifier: string;
  balance: number;
  freeRequest: number;
  allRequest: number;
  totalSpend: number;
  lastLogin: string;
}

export interface UsersResponse {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  users: ApiUser[];
}

export type UsersSortField =
  | "id"
  | "first_name"
  | "last_name"
  | "username"
  | "email"
  | "role"
  | "last_login";

export type SortOrder = "asc" | "desc";

export interface CreatedUserResponse {
  username: string;
  temporary_password: string;
}

export interface UserDetailsApi {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  registration_date: string;
  is_blocked: boolean;
  balance?: number;
  free_requests_count?: number;
  all_requests_count?: number;
  total_spent?: number;
  recent_requests?: [];
  total_requests?: number;
  last_login?: string;
}

export interface UserDetailsUI {
  id: string;
  nickName: string;
  name: string;
  surname: string;
  email: string;
  role: "User" | "Admin";
  registrationDate: string;
  status: "Active" | "Blocked";
  balance: number;
  freeRequest: number;
  allRequest: number;
  totalSpend: number;
  lastLogin: string;
}

export interface UpdateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
}

export interface DepositPayload {
  amount: number;
}

export interface ApiTelegramUser {
  id: number;
  telegram_id: number;
  telegram_username: string;
  status: string;
  reviewed_by_admin_id: number;
  rejection_reason: string;
  created_at: string;
  reviewed_at: string;
}

export interface TelegramUsersResponse {
  requests: ApiTelegramUser[];
}
export type RequestStatus =
  | "success"
  | "insufficient_funds"
  | "failed"
  | string;
export interface UserRequestItem {
  id: number;
  request_type: string;
  request_cost: string;
  status: "success" | "insufficient_funds" | string;
  request_date: string;
  search_query: string;
  results_count: number | null;
}

export interface UserRequestsResponse {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  requests: UserRequestItem[];
}
