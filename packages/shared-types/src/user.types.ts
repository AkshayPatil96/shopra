export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  SUSPENDED = 'SUSPENDED',
  HOLD = 'HOLD',
  PENDING = 'PENDING',
}

export interface User {
  _id?: number | string;
  id?: number | string;
  email: string;
  name: string;
  password: string;
  following: string[];
  avatarId?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
