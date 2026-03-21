import userApi from "./userApi";

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("admin_access_token");
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

  return data;
};

export const getDocumentPreview = async (docId: string) => {
  const { data } = await userApi.get(`/api/v1/corrections/${docId}`, {
    headers: getHeaders(),
  });
  return data;
};

export const updateMainInfo = async (
  docId: string,
  fieldUpdates: Record<string, any>,
  reason: string,
) => {
  const { data } = await userApi.patch(
    `/api/v1/corrections/${docId}/main-info`,
    {
      field_updates: fieldUpdates,
      reason,
    },
    { headers: getHeaders() },
  );

  return data;
};

export const updateAdditionalData = async (
  docId: string,
  updates: {
    old_key: string;
    new_key?: string;
    new_value?: string;
  }[],
  reason: string,
) => {
  const { data } = await userApi.patch(
    `/api/v1/corrections/${docId}/additional-data`,
    {
      updates,
      reason,
    },
    { headers: getHeaders() },
  );

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

export const deleteFieldValue = async (
  docId: string,
  fieldName: string,
  reason: string,
) => {
  const { data } = await userApi.delete(
    `/api/v1/corrections/${docId}/field/${fieldName}`,
    {
      params: { reason },
      headers: getHeaders(),
    },
  );

  return data;
};

export const bulkUpdateDocuments = async (
  rawFileId: string,
  corrections: {
    doc_id: string;
    field_updates: Record<string, any>;
  }[],
  reason: string,
) => {
  const { data } = await userApi.post(
    `/api/v1/corrections/bulk`,
    {
      raw_file_id: rawFileId,
      corrections,
      reason,
    },
    { headers: getHeaders() },
  );

  return data;
};

export const getCorrectionsHistory = async (params?: {
  doc_id?: string;
  raw_file_id?: string;
  page?: number;
  page_size?: number;
}) => {
  const { data } = await userApi.get(`/api/v1/corrections/history`, {
    params,
    headers: getHeaders(),
  });

  return data;
};

export const correctEntireFile = async (
  rawFileId: string,
  fieldUpdates: Record<string, any>,
  reason: string,
) => {
  const { data } = await userApi.post(
    `/api/v1/corrections/file/${rawFileId}`,
    {
      field_updates: fieldUpdates,
      reason,
    },
    { headers: getHeaders() },
  );

  return data;
};

export const getCorrectionTaskStatus = async (taskId: string) => {
  const { data } = await userApi.get(`/api/v1/corrections/task/${taskId}`, {
    headers: getHeaders(),
  });

  return data;
};

export const renameColumnInFile = async (
  rawFileId: string,
  oldColumn: string,
  newColumn: string,
  reason: string,
) => {
  const { data } = await userApi.post(
    `/api/v1/corrections/file/${rawFileId}/rename-column`,
    {
      old_column: oldColumn,
      new_column: newColumn,
      reason,
    },
    { headers: getHeaders() },
  );
  console.log(data);
  return data;
};

export const getPendingComplaintsCount = async () => {
  const { data } = await userApi.get(`/api/v1/complaints`, {
    params: {
      status: "pending",
      page_size: 1,
    },
    headers: getHeaders(),
  });

  return data.total;
};
