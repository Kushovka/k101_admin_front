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
  is_email_verified: boolean;
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
  confirmationEmail: "Yes" | "No";
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
  is_email_verified: boolean;
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
  confirmationEmail: "Yes" | "No";
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
