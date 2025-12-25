import axios, { AxiosInstance, AxiosError } from "axios";
import { normalizeError } from "./error";
import { getAccessToken, setAccessToken } from "./tokenStore";

export const createApi = (baseURL: string, type: "user" | "seller"): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
    headers: { "Content-Type": "application/json" }
  });

  // ➜ Request Interceptor
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const token = getAccessToken(type);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (err) => Promise.reject(normalizeError(err))
  );
  
  // ➜ Response Interceptor
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as any;

      if (error.response?.status === 401 && !original?._retry) {
        original._retry = true;

        const refreshed = await refresh(type);

        if (refreshed) {
          return instance(original);
        }
      }

      return Promise.reject(normalizeError(error));
    }
  );

  return instance;
};

export const refresh = async (type: "user" | "seller") => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY}auth/${type}/refresh-token`, {
      withCredentials: true,
    });
    setAccessToken(type, res.data.accessToken);
    return true;
  } catch {
    setAccessToken(type, null);
    return false;
  }
};