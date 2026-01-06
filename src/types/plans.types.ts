export type PlanType = "month" | "clicks";

export interface Plan {
  id: string;
  plan_name: string;
  price: number;
  month: number;
  archived: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PlanItem {
  id: string;
  plan_name: string;
  price: number;
  month?: number;
  clicks?: number;
  archived: boolean;
}

export interface PlansResponse {
  plans: Plan[];
  total: number;
}

export interface CreatePlanPayload {
  plan_name: string;
  price: number;
  month?: number;
  clicks?: number;
}

export interface PlanProps {
  name: string;
  price: number;
  duration?: number;
  clicks?: number;
  type?: PlanType;
  archived: boolean;
  className?: string;
  onClick?: () => void;
  onClick_archived?: () => void;
}

export interface UpdatePlanPayload extends CreatePlanPayload {}
