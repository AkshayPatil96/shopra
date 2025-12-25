import { CreateBrandDTO } from "@repo/shared-types";
import { createApi } from "../axiosBase";
import { apiRequest } from "../request";

const sellerApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}product`, "seller");
const userApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}product`, "user");

export const BrandApi = {
  createBrand: (data: CreateBrandDTO) => apiRequest.post(sellerApi, "/brands", data),
  getBrands: (params?: Record<string, any>) => apiRequest.get(userApi, "/brands", params),
  getBrandById: (id: string) => apiRequest.get(userApi, `/brands/${id}`),
  updateBrand: (id: string, data: CreateBrandDTO) => apiRequest.put(sellerApi, `/brands/${id}`, data),
  deleteBrand: (id: string) => apiRequest.delete(sellerApi, `/brands/${id}`),
}
