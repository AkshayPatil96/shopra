import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const ShopSchema = new Schema({
  name: String,
  bio: String,
  address: String,
  openingHours: String,
  website: String,
  socialLinks: [Schema.Types.Mixed],
  ratings: { type: Number, default: 0 },

  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller' },

  avatarId: { type: Schema.Types.ObjectId, ref: 'Image' },
  bannerId: { type: Schema.Types.ObjectId, ref: 'Image' },
}, { timestamps: true });

export const Shop = models.Shop || model('Shop', ShopSchema);
