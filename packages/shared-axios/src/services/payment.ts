import { createApi } from "../axiosBase";
import { apiRequest } from "../request";

const sellerApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}payment`, "seller");
const userApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}payment`, "user");

export const PaymentAPI = {
  connectStripe: () => apiRequest.post(sellerApi, "/connect-stripe"),
}