import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { JsonWebTokenError, ValidationError } from '@repo/error-handler';
import { sendMail } from '@repo/shared-email';
import {
  ensureUserOtpRequestAllowed,
  trackUserOtpRequest,
  storeUserOtp,
  validateUserOtp,
  storeUserPasswordResetToken,
  verifyUserPasswordResetToken,
} from './userAuth.cache.js';
import {
  findUserByEmail,
  findUserByEmailWithPassword,
  createUser,
  findUserById,
  updateUserPassword,
} from '../../repositories/user.repository.js';
import { issueAuthTokens, verifyRefreshToken } from '../../infra/jwt.js';

const USER_FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const formatName = (name?: string) => `${name || ''}`.trim();

export const requestUserRegistration = async ({ email, name }: { email: string; name: string }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ValidationError('Email is already registered');
  }

  await ensureUserOtpRequestAllowed(email);
  await trackUserOtpRequest(email);

  const otp = generateOtp();

  await sendMail({
    email,
    subject: 'Welcome! Activate Your Account',
    template: 'activation-mail.ejs',
    data: { user: { name: formatName(name) }, otp },
  });

  await storeUserOtp(email, otp);
};

export const verifyUserAccount = async ({
  email,
  otp,
  password,
  name,
}: {
  email: string;
  otp: string;
  password: string;
  name: string;
}) => {
  await validateUserOtp(email, otp);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ email, name, password: hashedPassword });
  const tokens = issueAuthTokens(user._id.toString(), 'user');

  return { user, tokens, role: 'user' as const };
};

export const loginUserAccount = async ({ email, password }: { email: string; password: string }) => {
  const user = await findUserByEmailWithPassword(email);

  if (!user) {
    throw new ValidationError('Invalid email or password');
  }

  if (user.password) {
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }
  }

  const tokens = issueAuthTokens(user._id.toString(), 'user');

  return { user, tokens, role: 'user' as const };
};

export const refreshUserSession = async (token?: string) => {
  if (!token) {
    throw new JsonWebTokenError('Invalid or expired refresh token');
  }

  const decoded = verifyRefreshToken(token);

  if (!decoded?.sub) {
    throw new JsonWebTokenError('Invalid or expired refresh token');
  }

  const user = await findUserById(decoded.sub);

  if (!user) {
    throw new ValidationError('User not found');
  }

  const tokens = issueAuthTokens(user._id.toString(), decoded.role);

  return { user, tokens, role: decoded.role };
};

export const initiateUserPasswordReset = async (email: string) => {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new ValidationError('No user found with this email');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  await ensureUserOtpRequestAllowed(email);
  await trackUserOtpRequest(email);
  const resetUrl = `${USER_FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  await sendMail({
    email,
    subject: 'Reset Your Password',
    template: 'forgot-password.ejs',
    data: { user: { name: formatName(user.name) }, resetUrl },
  });

  await storeUserPasswordResetToken(email, resetToken);
};

export const resetUserPassword = async ({
  email,
  token,
  newPassword,
}: {
  email: string;
  token: string;
  newPassword: string;
}) => {
  const user = await findUserByEmailWithPassword(email);

  if (!user) {
    throw new ValidationError('No user found with this email');
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password || '');

  if (isSamePassword) {
    throw new ValidationError('New password must be different from the old password');
  }

  await verifyUserPasswordResetToken(email, token);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(email, hashedPassword);
};

export const getUserProfileData = async (userId?: string) => {
  const user = userId ? await findUserById(userId) : null;

  if (!user) {
    throw new ValidationError('User not authenticated');
  }

  return user;
};
