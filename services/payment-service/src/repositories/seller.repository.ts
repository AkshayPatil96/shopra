import { connectMongo, Seller, type ISellerDocument } from "@repo/db-mongodb";

type SellerResult = ISellerDocument | null;
type SellerUpdateResult = ISellerDocument | null;
type SellerUpdateData = Partial<Pick<ISellerDocument, "stripeId" | "status" | "email">>;

const ensureMongoConnection = () => connectMongo();

export const findSellerById = async (id: string): Promise<SellerResult> => {
  await ensureMongoConnection();
  return Seller.findById(id).exec();
};

export const updateSellerRecord = async (id: string, data: SellerUpdateData): Promise<SellerUpdateResult> => {
  await ensureMongoConnection();
  return Seller.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true },
  ).exec();
};
