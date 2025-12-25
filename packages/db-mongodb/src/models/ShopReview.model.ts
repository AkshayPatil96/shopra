import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const ShopReviewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
  rating: Number,
  reviews: String,
}, { timestamps: true });

export const ShopReview =
  models.ShopReview || model('ShopReview', ShopReviewSchema);
