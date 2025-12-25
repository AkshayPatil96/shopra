import { createApi } from "../axiosBase";
import { apiRequest } from "../request";
import { CategoryFormDTO } from '@repo/shared-types';

const sellerApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}product`, "seller");
const userApi = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}product`, "user");

export const CategoryAPI = {
  createCategory: (data: CategoryFormDTO) => apiRequest.post(sellerApi, "/categories", data),
  getCategories: (params?: Record<string, any>) => apiRequest.get(userApi, "/categories", params),
  getCategoryById: (id: string) => apiRequest.get(userApi, `/categories/${id}`),
  updateCategory: (id: string, data: CategoryFormDTO) => apiRequest.put(sellerApi, `/categories/${id}`, data),
  deleteCategory: (id: string) => apiRequest.delete(sellerApi, `/categories/${id}`),
}