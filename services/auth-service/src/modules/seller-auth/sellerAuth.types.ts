import { ISellerDocument } from '@repo/db-mongodb';
import { SellerDTO } from '@repo/shared-types';

export const toSellerDTO = (seller: ISellerDocument): SellerDTO => ({
  id: seller._id.toString(),
  name: seller.name,
  email: seller.email,
  phone: seller.phone,
  country: seller.country,
  address: seller.address,
  stripeConnected: Boolean(seller.stripeId),
  status: seller.status,
  createdAt: seller.createdAt.toISOString(),
  updatedAt: seller.updatedAt.toISOString(),
});

export const toSellerProfileDTO = (
  seller: ISellerDocument & { shops: { id: string; name: string }[] | [] }
): SellerDTO => ({
  id: seller._id.toString(),
  name: seller.name,
  email: seller.email,
  phone: seller.phone,
  country: seller.country,
  address: seller.address,
  stripeConnected: Boolean(seller.stripeId),
  status: seller.status,
  shops: seller.shops,
  createdAt: seller.createdAt.toISOString(),
  updatedAt: seller.updatedAt.toISOString(),
});
