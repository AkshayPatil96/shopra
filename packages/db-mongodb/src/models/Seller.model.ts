import mongoose, { Document, Model, Types } from "mongoose";
import { UserStatus } from "@repo/shared-types";

const { Schema, model, models } = mongoose;

export interface ISellerDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  country: string;
  address?: string;
  stripeId?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISellerDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    stripeId: {
      type: String,
      unique: true,
      sparse: true, // 🔥 important for optional unique field
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Seller: Model<ISellerDocument> =
  models.Seller || model<ISellerDocument>("Seller", SellerSchema);
