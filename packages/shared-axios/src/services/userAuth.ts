import { createApi } from "../axiosBase";
import { apiRequest } from "../request";
import { setAccessToken } from "../tokenStore";

const api = createApi(`${process.env.NEXT_PUBLIC_API_GATEWAY}auth/user`, "user");

export const UserAuthAPI = {
  register: (body: any) => apiRequest.post(api, "/register", body),
  verifyOtp: (body: any) => apiRequest.post(api, "/verify-otp", body),
  login: async (body: any) => {
    const res = await apiRequest.post(api, "/login", body) as { accessToken?: string };
    if (res?.accessToken) setAccessToken("user", res.accessToken);
    return res;
  },
  refresh: async () => {
    const res = await apiRequest.get(api, "/refresh-token") as { accessToken?: string };
    if (res?.accessToken) setAccessToken("user", res.accessToken);

    return res;
  },
  forgotPassword: (body: any) => apiRequest.post(api, "/forgot-password", body),
  me: () => apiRequest.get(api, "/me"),
  verifyForgotPasswordOtp: (body: any) => apiRequest.post(api, "/verify-forgot-password-otp", body),
  resetPassword: (body: any) => apiRequest.post(api, "/reset-password", body),
  logout: () => {
    const res = apiRequest.post(api, "/logout");
    setAccessToken("user", null);
    return res;
  },
};
