import { User } from '@repo/db-mongodb';
import { IUserDocument } from '@repo/db-mongodb';

export const findUserByEmail = (email: string): Promise<IUserDocument | null> =>
  User.findOne({ email }).exec();

export const findUserByEmailWithPassword = (email: string): Promise<IUserDocument | null> =>
  User.findOne({ email }).select('+password').exec();

export const createUser = (data: { email: string; name: string; password: string }): Promise<IUserDocument> =>
  User.create(data);

export const findUserById = (id: string): Promise<IUserDocument | null> =>
  User.findById(id).exec();

export const updateUserPassword = (email: string, password: string): Promise<IUserDocument | null> =>
  User.findOneAndUpdate({ email }, { password }, { new: true }).exec();
