import userApi from "./userApi";

import type {
  Plan,
  CreatePlanPayload,
  UpdatePlanPayload,
  PlansResponse,
} from "../types/plans.types";

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Access token not found");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

// PLANS
export const allPlans = async (): Promise<PlansResponse> => {
  const { data } = await userApi.get<PlansResponse>(`/api/v1/plans`, {
    headers: getHeaders(),
  });
  console.log(data);
  return data;
};

export const allArchivedPlans = async (): Promise<PlansResponse> => {
  const { data } = await userApi.get<PlansResponse>(`/api/v1/plans/archived`, {
    headers: getHeaders(),
  });
  console.log(data);
  return data;
};

export const createPlans = async (
  payload: CreatePlanPayload
): Promise<Plan> => {
  const { data } = await userApi.post<Plan>(`/api/v1/plans`, payload, {
    headers: getHeaders(),
  });
  console.log(data);
  return data;
};

export const updatePlans = async (
  id: string,
  payload: UpdatePlanPayload
): Promise<Plan> => {
  const { data } = await userApi.put<Plan>(`/api/v1/plans/${id}`, payload, {
    headers: getHeaders(),
  });
  console.log(data);
  return data;
};

export const archivedPlans = async (id: string): Promise<Plan> => {
  const { data } = await userApi.patch<Plan>(
    `/api/v1/plans/${id}`,
    { archived: true },
    {
      headers: getHeaders(),
    }
  );
  console.log(data);
  return data;
};

export const unarchivedPlans = async (id: string): Promise<Plan> => {
  const { data } = await userApi.patch<Plan>(
    `/api/v1/plans/${id}`,
    { archived: false },
    {
      headers: getHeaders(),
    }
  );
  console.log(data);
  return data;
};
