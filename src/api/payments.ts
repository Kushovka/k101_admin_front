import userApi from "./userApi";

export const createInvoice = async (amount: number) => {
  const { data } = await userApi.post("/api/v1/payments/create-invoice", {
    amount,
    currency: "RUB",
  });
  return data;
};

export const getPaymentStatus = async (paymentId: number) => {
  const { data } = await userApi.get(`/api/v1/payments/${paymentId}`);
  return data;
};

export const getPaymentsHistory = async (limit = 10) => {
  const { data } = await userApi.get(`/api/v1/payments/history`, {
    params: { limit },
  });
  return data;
};
