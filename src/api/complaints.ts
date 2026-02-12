import userApi from "./userApi";

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

export const getAllComplaints = async () => {
  const { data } = await userApi.get(`/api/v1/complaints`, {
    headers: getHeaders(),
  });
  return data;
};

export const reviewComplaint = async (
  complaintId: number,
  status: "resolved" | "rejected" | "reviewed",
  adminComment?: string,
  correctionId?: number,
) => {
  const { data } = await userApi.patch(
    `/api/v1/complaints/${complaintId}`,
    {
      status,
      admin_comment: adminComment,
      correction_id: correctionId,
    },
    { headers: getHeaders() },
  );
  console.log(data);
  return data;
};
