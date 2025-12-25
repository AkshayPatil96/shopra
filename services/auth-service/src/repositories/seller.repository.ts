import { Seller, Shop } from '@repo/db-mongodb';
import { ISellerDocument } from '@repo/db-mongodb';

export const findSellerByEmail = (email: string): Promise<ISellerDocument | null> =>
  Seller.findOne({ email }).exec();

export const findSellerByEmailWithPassword = (email: string): Promise<ISellerDocument | null> =>
  Seller.findOne({ email }).select('+password').exec();

export const createSeller = (data: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  country?: string;
}): Promise<ISellerDocument> => Seller.create(data);

export const findSellerById = (id: string): Promise<ISellerDocument | null> =>
  Seller.findById(id).exec();

export const updateSellerPassword = (email: string, password: string): Promise<ISellerDocument | null> =>
  Seller.findOneAndUpdate({ email }, { password }, { new: true }).exec();

export const aggregateSellerProfile = (sellerId: string | number) =>
  Seller.aggregate([
    { $match: { _id: sellerId } },
    {
      $lookup: {
        from: 'shops',
        localField: '_id',
        foreignField: 'sellerId',
        as: 'shops',
        pipeline: [{ $project: { id: 1, name: 1 } }],
      },
    },
  ]);

export const createShopRecord = (data: Record<string, unknown>) => Shop.create(data);
