import mongoose, { Document, Model, Types } from "mongoose";
import { UserStatus } from "@repo/shared-types";

const { Schema, model, models } = mongoose;

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  following: Types.ObjectId[];
  avatarId?: Types.ObjectId;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    avatarId: {
      type: Schema.Types.ObjectId,
      ref: "Image",
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User: Model<IUserDocument> =
  models.User || model<IUserDocument>("User", UserSchema);

