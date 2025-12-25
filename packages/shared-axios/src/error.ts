import { AxiosError } from "axios";
import { ApiError } from "./types";

export const normalizeError = (error: AxiosError): ApiError => {
  return {
    status: error.response?.status || 500,
    message:
      (error.response?.data as any)?.error?.message ||
      (error.response?.data as any)?.message ||
      error.message ||
      "Something went wrong",
    details: error.response?.data,
  };
};
