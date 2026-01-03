import { Types } from "mongoose";
import { Seller } from "../models/Seller.model.js";

export const aggregateSellerProfile = async (sellerId: string) => {
  const objectId = new Types.ObjectId(sellerId);

  const [seller] = await Seller.aggregate([
    { $match: { _id: objectId } },
    {
      $lookup: {
        from: "shops",
        localField: "_id",
        foreignField: "sellerId",
        as: "shops",
        pipeline: [{ $project: { _id: 1, name: 1 } }],
      },
    },
  ]);

  return seller ?? null;
};
