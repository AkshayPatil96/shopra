import { AxiosInstance } from "axios";

export const apiRequest = {
  get: async <T>(instance: AxiosInstance, url: string, params?: any): Promise<T> => {
    const { data } = await instance.get(url, { params });
    return data;
  },

  post: async <T>(instance: AxiosInstance, url: string, body?: any): Promise<T> => {
    const { data } = await instance.post(url, body);
    return data;
  },

  put: async <T>(instance: AxiosInstance, url: string, body?: any): Promise<T> => {
    const { data } = await instance.put(url, body);
    return data;
  },

  patch: async <T>(instance: AxiosInstance, url: string, body?: any): Promise<T> => {
    const { data } = await instance.patch(url, body);
    return data;
  },

  delete: async <T>(instance: AxiosInstance, url: string): Promise<T> => {
    const { data } = await instance.delete(url);
    return data;
  }
};
