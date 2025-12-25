import { UserStatus } from "./user.types.js";

export interface SellerDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  address?: string;
  shops?: { id: string; name: string }[] | [];
  stripeConnected: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
