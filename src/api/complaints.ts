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

export const getDocumentPreview = async (docId: string) => {
  const { data } = await userApi.get(`/api/v1/corrections/${docId}`, {
    headers: getHeaders(),
  });
  return data;
};

export const updateDocument = async (
  docId: string,
  fieldUpdates: Record<string, any>,
  reason: string,
) => {
  const { data } = await userApi.patch(
    `/api/v1/corrections/${docId}`,
    {
      apply_scope: "single",
      field_updates: fieldUpdates,
      reason,
    },
    { headers: getHeaders() },
  );
  console.log({
    apply_scope: "single",
    field_updates: data,
    reason,
  });

  return data;
};

export const remapFields = async (
  docId: string,
  remappings: {
    from_field: string;
    to_field: string;
  }[],
  reason: string,
) => {
  const { data } = await userApi.post(
    `/api/v1/corrections/${docId}/remap`,
    {
      reason,
      remappings,
    },
    { headers: getHeaders() },
  );

  return data;
};
