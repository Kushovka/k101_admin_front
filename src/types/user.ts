export type UserRole = "user" | "admin";

export interface ApiUser {
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
}

export interface TableUser {
  id: string;
  nickName: string;
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
}

export interface UsersResponse {
  users: ApiUser[];
}

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
