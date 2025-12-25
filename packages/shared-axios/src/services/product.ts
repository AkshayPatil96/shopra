
import { createApi } from "../axiosBase";
import { apiRequest } from "../request";

const sellerApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}products`, "seller");
const userApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}products`, "user");

export const ProductAPI = {
  createProduct: (data: FormData) => apiRequest.post(sellerApi, "/", data),
  updateProduct: (productId: string, data: FormData) => apiRequest.put(sellerApi, `/${productId}`, data),
}