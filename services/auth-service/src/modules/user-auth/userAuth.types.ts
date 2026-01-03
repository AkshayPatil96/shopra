import { IUserDocument } from '@repo/db-mongodb';
import { UserDTO } from '@repo/shared-types';

export const toUserDTO = (user: IUserDocument): UserDTO => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  avatarId: user.avatarId?.toString(),
  following: (user.following || []).map((followedUserId) => followedUserId.toString()),
  status: user.status,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});
