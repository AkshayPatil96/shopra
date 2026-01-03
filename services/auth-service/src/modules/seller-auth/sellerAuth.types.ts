import { ISellerDocument } from '@repo/db-mongodb';
import { SellerDTO } from '@repo/shared-types';

export type SellerWithShops = ISellerDocument & {
  shops?: Array<{ id?: string; _id?: { toString(): string } | string; name: string }> | [];
};

export const toSellerDTO = (seller: ISellerDocument): SellerDTO => ({
  id: seller._id.toString(),
  name: seller.name,
  email: seller.email,
  phone: seller.phone,
  country: seller.country,
  address: seller.address,
  stripeId: seller.stripeId,
  status: seller.status,
  createdAt: seller.createdAt.toISOString(),
  updatedAt: seller.updatedAt.toISOString(),
});

export const toSellerProfileDTO = (seller: SellerWithShops): SellerDTO => ({
  id: seller._id.toString(),
  name: seller.name,
  email: seller.email,
  phone: seller.phone,
  country: seller.country,
  address: seller.address,
  stripeId: seller.stripeId,
  status: seller.status,
  shops: (seller.shops || []).map((shop) => ({
    id:
      shop.id ||
      (typeof shop._id === 'string'
        ? shop._id
        : typeof shop._id === 'object' && shop._id
          ? shop._id.toString()
          : ''),
    name: shop.name,
  })),
  createdAt: seller.createdAt.toISOString(),
  updatedAt: seller.updatedAt.toISOString(),
});
